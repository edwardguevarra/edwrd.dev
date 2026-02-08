import type { BlogSearchService } from "../../types/shared.types";
import type { BlogSearchPostData, BlogSearchServiceConfig } from "./types";
import {
  BLOG_SEARCH_DEFAULT_DEBOUNCE_MS,
  BLOG_SEARCH_HIDE_TRANSITION_MS,
} from "./config";
import { createLogger } from "../../utils/logger";
import {
  ConfigurationError,
  DOMElementNotFoundError,
  ServiceInitializationError,
} from "../../errors/types";

const STYLE_ELEMENT_ID = "blog-search-service-style";
const HIDDEN_CLASS = "blog-search-hidden";
const VISIBLE_CLASS = "blog-search-visible";

function isBlogSearchPostData(value: unknown): value is BlogSearchPostData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    id?: unknown;
    title?: unknown;
    tags?: unknown;
  };

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag: unknown) => typeof tag === "string")
  );
}

export function createBlogSearchService(
  config: BlogSearchServiceConfig
): BlogSearchService {
  const logger = createLogger("BlogSearchService");
  const { searchInput, postsGrid, noResults } = config.elements;
  const debounceMs = config.debounceMs ?? BLOG_SEARCH_DEFAULT_DEBOUNCE_MS;

  let debounceTimer: number | null = null;
  let createdStyleElement = false;
  let styleElement: HTMLStyleElement | null = null;
  let postsById = new Map<string, BlogSearchPostData>();

  if (!searchInput) {
    throw new DOMElementNotFoundError("blog-search");
  }

  if (!postsGrid) {
    throw new DOMElementNotFoundError("blog-posts-grid");
  }

  if (!noResults) {
    throw new DOMElementNotFoundError("no-results");
  }

  const parsePostsData = (): BlogSearchPostData[] => {
    const rawPostsData = searchInput.dataset.posts ?? "[]";

    try {
      const parsedData = JSON.parse(rawPostsData) as unknown;

      if (!Array.isArray(parsedData)) {
        throw new ConfigurationError("Blog posts dataset must be an array");
      }

      const validPosts = parsedData.filter(isBlogSearchPostData);

      if (validPosts.length !== parsedData.length) {
        logger.warn("Ignored invalid blog post entries", {
          invalidEntriesCount: parsedData.length - validPosts.length,
        });
      }

      return validPosts;
    } catch (error) {
      if (error instanceof ConfigurationError) {
        throw error;
      }

      throw new ConfigurationError("Failed to parse blog posts dataset", error);
    }
  };

  const ensureStyles = (): void => {
    const existingStyleElement = document.getElementById(STYLE_ELEMENT_ID);

    if (existingStyleElement instanceof HTMLStyleElement) {
      styleElement = existingStyleElement;
      return;
    }

    styleElement = document.createElement("style");
    styleElement.id = STYLE_ELEMENT_ID;
    styleElement.textContent = `
      [data-post-id] {
        transition: opacity ${BLOG_SEARCH_HIDE_TRANSITION_MS}ms ease-in-out;
      }
      .${HIDDEN_CLASS} {
        opacity: 0 !important;
      }
      .${VISIBLE_CLASS} {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(styleElement);
    createdStyleElement = true;
  };

  const setCardVisible = (card: HTMLElement): void => {
    card.style.display = "block";
    card.classList.remove(HIDDEN_CLASS);
    card.classList.add(VISIBLE_CLASS);
  };

  const setCardHidden = (card: HTMLElement): void => {
    card.classList.remove(VISIBLE_CLASS);
    card.classList.add(HIDDEN_CLASS);

    window.setTimeout(() => {
      if (card.classList.contains(HIDDEN_CLASS)) {
        card.style.display = "none";
      }
    }, BLOG_SEARCH_HIDE_TRANSITION_MS);
  };

  const matchesSearch = (
    postData: BlogSearchPostData,
    normalizedSearch: string
  ): boolean => {
    if (normalizedSearch === "") {
      return true;
    }

    if (postData.title.toLowerCase().includes(normalizedSearch)) {
      return true;
    }

    return postData.tags.some((tag: string) =>
      tag.toLowerCase().includes(normalizedSearch)
    );
  };

  const filterPosts = (searchTerm: string): void => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    const postCards =
      postsGrid.querySelectorAll<HTMLElement>("a[data-post-id]");
    let visibleCount = 0;

    postCards.forEach((card: HTMLElement) => {
      const postId = card.dataset.postId;

      if (!postId) {
        return;
      }

      const postData = postsById.get(postId);

      if (!postData) {
        return;
      }

      if (matchesSearch(postData, normalizedSearch)) {
        setCardVisible(card);
        visibleCount++;
      } else {
        setCardHidden(card);
      }
    });

    if (visibleCount === 0 && normalizedSearch !== "") {
      noResults.classList.remove("hidden");
    } else {
      noResults.classList.add("hidden");
    }
  };

  const updateUrl = (searchTerm: string): void => {
    const trimmedSearchTerm = searchTerm.trim();
    const url = new URL(window.location.href);

    if (trimmedSearchTerm) {
      url.searchParams.set("q", trimmedSearchTerm);
    } else {
      url.searchParams.delete("q");
    }

    window.history.replaceState({}, "", url.toString());
  };

  const handleSearch = (event: Event): void => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const searchTerm = target.value;

    if (debounceTimer !== null) {
      window.clearTimeout(debounceTimer);
    }

    debounceTimer = window.setTimeout(() => {
      filterPosts(searchTerm);
      updateUrl(searchTerm);
    }, debounceMs);
  };

  const initializeFromUrl = (): void => {
    const searchFromUrl = new URLSearchParams(window.location.search).get("q");

    if (!searchFromUrl) {
      return;
    }

    searchInput.value = searchFromUrl;
    filterPosts(searchFromUrl);
  };

  const initialize = (): void => {
    try {
      logger.info("Initializing service");
      const postsData = parsePostsData();

      postsById = new Map(
        postsData.map((post: BlogSearchPostData) => [post.id, post])
      );

      ensureStyles();
      searchInput.addEventListener("input", handleSearch);
      initializeFromUrl();

      logger.info("Service initialized", {
        postsCount: postsData.length,
      });
    } catch (error) {
      logger.error("Initialization failed", { error });
      throw new ServiceInitializationError(
        "BlogSearchService",
        "Failed to initialize",
        error
      );
    }
  };

  const destroy = (): void => {
    try {
      searchInput.removeEventListener("input", handleSearch);

      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
        debounceTimer = null;
      }

      if (createdStyleElement) {
        styleElement?.remove();
      }

      postsById.clear();
      logger.info("Service destroyed");
    } catch (error) {
      logger.error("Cleanup failed", { error });
    }
  };

  return {
    initialize,
    destroy,
  };
}
