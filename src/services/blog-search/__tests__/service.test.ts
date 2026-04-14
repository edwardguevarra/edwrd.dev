import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBlogSearchService } from "../index";
import {
  BLOG_SEARCH_DEFAULT_DEBOUNCE_MS,
  BLOG_SEARCH_HIDE_TRANSITION_MS,
} from "../config";
import type { BlogSearchElements } from "../types";
import {
  DOMElementNotFoundError,
  ServiceInitializationError,
} from "../../../errors/types";

const STYLE_ELEMENT_ID = "blog-search-service-style";
const CUSTOM_BLOG_SEARCH_DEBOUNCE_MS = 500;

interface BlogSearchTestSetup {
  elements: BlogSearchElements;
  searchInput: HTMLInputElement;
  noResults: HTMLElement;
  firstCard: HTMLAnchorElement;
  secondCard: HTMLAnchorElement;
}

function createSearchDom(): BlogSearchTestSetup {
  const searchInput = document.createElement("input");
  searchInput.id = "blog-search";
  searchInput.dataset.posts = JSON.stringify([
    {
      id: "post-1",
      title: "Astro Patterns",
      tags: ["astro", "frontend"],
    },
    {
      id: "post-2",
      title: "Testing Services",
      tags: ["vitest", "typescript"],
    },
  ]);

  const postsGrid = document.createElement("div");
  postsGrid.id = "blog-posts-grid";

  const firstCard = document.createElement("a");
  firstCard.dataset.postId = "post-1";

  const secondCard = document.createElement("a");
  secondCard.dataset.postId = "post-2";

  postsGrid.append(firstCard, secondCard);

  const noResults = document.createElement("div");
  noResults.id = "no-results";
  noResults.classList.add("hidden");

  document.body.append(searchInput, noResults, postsGrid);

  return {
    elements: {
      searchInput,
      postsGrid,
      noResults,
    },
    searchInput,
    noResults,
    firstCard,
    secondCard,
  };
}

describe("createBlogSearchService", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
    window.history.replaceState({}, "", "/blog");
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
    document.head.innerHTML = "";
    window.history.replaceState({}, "", "/blog");
  });

  it("initializes and destroys successfully", () => {
    const { elements } = createSearchDom();
    const service = createBlogSearchService({ elements });

    expect(service.initialize).toBeInstanceOf(Function);
    expect(service.destroy).toBeInstanceOf(Function);

    service.initialize();
    expect(document.getElementById(STYLE_ELEMENT_ID)).toBeInstanceOf(
      HTMLStyleElement
    );

    service.destroy();
    expect(document.getElementById(STYLE_ELEMENT_ID)).toBeNull();
  });

  it("filters posts and updates the query parameter", () => {
    const { elements, searchInput, firstCard, secondCard, noResults } =
      createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    searchInput.value = "testing";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(firstCard.style.display).toBe("none");
    expect(secondCard.style.display).toBe("block");
    expect(noResults.classList.contains("hidden")).toBe(true);
    expect(new URL(window.location.href).searchParams.get("q")).toBe("testing");

    service.destroy();
  });

  it("filters posts by tags and handles case-insensitive search", () => {
    const { elements, searchInput, firstCard, secondCard, noResults } =
      createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    searchInput.value = "ASTRO";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(firstCard.style.display).toBe("block");
    expect(secondCard.style.display).toBe("none");
    expect(noResults.classList.contains("hidden")).toBe(true);

    service.destroy();
  });

  it("shows no results message when no posts match", () => {
    const { elements, searchInput, firstCard, secondCard, noResults } =
      createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    searchInput.value = "no-match";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(firstCard.style.display).toBe("none");
    expect(secondCard.style.display).toBe("none");
    expect(noResults.classList.contains("hidden")).toBe(false);

    service.destroy();
  });

  it("hides no results message again when a later search matches posts", () => {
    const { elements, searchInput, firstCard, secondCard, noResults } =
      createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    searchInput.value = "no-match";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(noResults.classList.contains("hidden")).toBe(false);
    expect(firstCard.style.display).toBe("none");
    expect(secondCard.style.display).toBe("none");

    searchInput.value = "Astro";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(noResults.classList.contains("hidden")).toBe(true);
    expect(firstCard.style.display).toBe("block");
    expect(secondCard.style.display).toBe("none");

    service.destroy();
  });

  it("loads search term from URL during initialization", () => {
    const { elements, searchInput, firstCard, secondCard } = createSearchDom();
    window.history.replaceState({}, "", "/blog?q=astro");

    const service = createBlogSearchService({ elements });
    service.initialize();

    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(searchInput.value).toBe("astro");
    expect(firstCard.style.display).toBe("block");
    expect(secondCard.style.display).toBe("none");

    service.destroy();
  });

  it("syncs the search term to URL only after debounce", () => {
    const { elements, searchInput } = createSearchDom();
    const service = createBlogSearchService({
      elements,
      debounceMs: CUSTOM_BLOG_SEARCH_DEBOUNCE_MS,
    });

    service.initialize();

    searchInput.value = "testing";
    searchInput.dispatchEvent(new Event("input"));

    expect(new URL(window.location.href).searchParams.get("q")).toBeNull();

    vi.advanceTimersByTime(CUSTOM_BLOG_SEARCH_DEBOUNCE_MS - 1);
    expect(new URL(window.location.href).searchParams.get("q")).toBeNull();

    vi.advanceTimersByTime(1);
    expect(new URL(window.location.href).searchParams.get("q")).toBe("testing");

    service.destroy();
  });

  it("applies only the latest input when events fire before debounce", () => {
    const { elements, searchInput, firstCard, secondCard } = createSearchDom();
    const service = createBlogSearchService({
      elements,
      debounceMs: BLOG_SEARCH_DEFAULT_DEBOUNCE_MS,
    });

    service.initialize();

    searchInput.value = "astro";
    searchInput.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(150);

    searchInput.value = "testing";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(firstCard.style.display).toBe("none");
    expect(secondCard.style.display).toBe("block");
    expect(new URL(window.location.href).searchParams.get("q")).toBe("testing");

    service.destroy();
  });

  it("removes the query parameter when the input is cleared", () => {
    const { elements, searchInput } = createSearchDom();
    window.history.replaceState({}, "", "/blog?q=existing");

    const service = createBlogSearchService({
      elements,
      debounceMs: BLOG_SEARCH_DEFAULT_DEBOUNCE_MS,
    });
    service.initialize();

    searchInput.value = "   ";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);

    expect(new URL(window.location.href).searchParams.get("q")).toBeNull();

    service.destroy();
  });

  it("removes input listener during destroy", () => {
    const { elements, searchInput } = createSearchDom();
    const removeListenerSpy = vi.spyOn(searchInput, "removeEventListener");

    const service = createBlogSearchService({ elements });
    service.initialize();
    service.destroy();

    expect(removeListenerSpy).toHaveBeenCalled();
  });

  it("throws when required elements are missing", () => {
    const { elements } = createSearchDom();
    const invalidElements = {
      ...elements,
      postsGrid: null as unknown as HTMLElement,
    };

    expect(() =>
      createBlogSearchService({ elements: invalidElements })
    ).toThrow(DOMElementNotFoundError);
  });

  it("throws when search input is missing", () => {
    const { elements } = createSearchDom();
    expect(() =>
      createBlogSearchService({
        elements: {
          ...elements,
          searchInput: null as unknown as HTMLInputElement,
        },
      })
    ).toThrow(DOMElementNotFoundError);
  });

  it("throws when no-results element is missing", () => {
    const { elements } = createSearchDom();
    expect(() =>
      createBlogSearchService({
        elements: {
          ...elements,
          noResults: null as unknown as HTMLElement,
        },
      })
    ).toThrow(DOMElementNotFoundError);
  });

  it("throws ConfigurationError when dataset is not an array", () => {
    const { elements } = createSearchDom();
    elements.searchInput.dataset.posts = JSON.stringify({ not: "an array" });

    const service = createBlogSearchService({ elements });

    expect(() => service.initialize()).toThrow(ServiceInitializationError);
  });

  it("initializes successfully with an empty dataset when data-posts is missing", () => {
    const { elements } = createSearchDom();
    delete elements.searchInput.dataset.posts;

    const service = createBlogSearchService({ elements });

    expect(() => service.initialize()).not.toThrow();
    service.destroy();
  });

  it("warns and filters out invalid post entries in the dataset", () => {
    const { elements, searchInput, firstCard } = createSearchDom();
    elements.searchInput.dataset.posts = JSON.stringify([
      { id: "post-1", title: "Astro Patterns", tags: ["astro"] },
      { id: "post-broken", title: 123, tags: ["bad"] },
      "not-an-object",
    ]);

    const service = createBlogSearchService({ elements });
    service.initialize();

    searchInput.value = "astro";
    searchInput.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(firstCard.style.display).toBe("block");

    service.destroy();
  });

  it("throws initialization error when posts dataset is invalid", () => {
    const { elements } = createSearchDom();
    elements.searchInput.dataset.posts = "{invalid-json";

    const service = createBlogSearchService({ elements });

    expect(() => service.initialize()).toThrow(ServiceInitializationError);
    service.destroy();
  });

  it("reuses an existing blog-search style element", () => {
    const existingStyle = document.createElement("style");
    existingStyle.id = STYLE_ELEMENT_ID;
    existingStyle.textContent = "/* pre-existing */";
    document.head.appendChild(existingStyle);

    const { elements } = createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    expect(document.querySelectorAll(`#${STYLE_ELEMENT_ID}`).length).toBe(1);
    expect(document.getElementById(STYLE_ELEMENT_ID)).toBe(existingStyle);

    service.destroy();

    expect(document.getElementById(STYLE_ELEMENT_ID)).toBe(existingStyle);
  });

  it("ignores input events whose target is not an input element", () => {
    const { elements, firstCard, secondCard } = createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    const foreignEvent = new Event("input");
    Object.defineProperty(foreignEvent, "target", {
      value: document.createElement("div"),
    });
    elements.searchInput.dispatchEvent(foreignEvent);

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);

    expect(firstCard.style.display).toBe("");
    expect(secondCard.style.display).toBe("");
    expect(new URL(window.location.href).searchParams.get("q")).toBeNull();

    service.destroy();
  });

  it("skips cards missing post id or lacking matching post data", () => {
    const { elements, searchInput, firstCard, secondCard } = createSearchDom();

    const orphanCard = document.createElement("a");
    orphanCard.dataset.postId = "post-missing";
    elements.postsGrid.appendChild(orphanCard);

    const unidentifiedCard = document.createElement("a");
    unidentifiedCard.setAttribute("data-post-id", "");
    elements.postsGrid.appendChild(unidentifiedCard);

    const service = createBlogSearchService({ elements });
    service.initialize();

    searchInput.value = "astro";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(firstCard.style.display).toBe("block");
    expect(secondCard.style.display).toBe("none");
    expect(orphanCard.style.display).toBe("");
    expect(unidentifiedCard.style.display).toBe("");

    service.destroy();
  });

  it("logs and swallows cleanup errors during destroy", () => {
    const { elements, searchInput } = createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    vi.spyOn(searchInput, "removeEventListener").mockImplementation(() => {
      throw new Error("cleanup boom");
    });

    expect(() => service.destroy()).not.toThrow();
  });
});
