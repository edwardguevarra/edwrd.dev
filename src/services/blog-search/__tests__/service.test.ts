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
const HIDDEN_CLASS = "blog-search-hidden";
const VISIBLE_CLASS = "blog-search-visible";
const COLLAPSED_CLASS = "blog-search-collapsed";

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
    expect(document.getElementById(STYLE_ELEMENT_ID)).toBeNull();

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

    expect(firstCard.classList.contains(HIDDEN_CLASS)).toBe(true);
    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(true);
    expect(secondCard.classList.contains(VISIBLE_CLASS)).toBe(true);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(false);
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

    expect(firstCard.classList.contains(VISIBLE_CLASS)).toBe(true);
    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(false);
    expect(secondCard.classList.contains(HIDDEN_CLASS)).toBe(true);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(true);
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

    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(true);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(true);
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
    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(true);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(true);

    searchInput.value = "Astro";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(BLOG_SEARCH_DEFAULT_DEBOUNCE_MS);
    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(noResults.classList.contains("hidden")).toBe(true);
    expect(firstCard.classList.contains(VISIBLE_CLASS)).toBe(true);
    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(false);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(true);

    service.destroy();
  });

  it("loads search term from URL during initialization", () => {
    const { elements, searchInput, firstCard, secondCard } = createSearchDom();
    window.history.replaceState({}, "", "/blog?q=astro");

    const service = createBlogSearchService({ elements });
    service.initialize();

    vi.advanceTimersByTime(BLOG_SEARCH_HIDE_TRANSITION_MS);

    expect(searchInput.value).toBe("astro");
    expect(firstCard.classList.contains(VISIBLE_CLASS)).toBe(true);
    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(false);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(true);

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

    expect(firstCard.classList.contains(COLLAPSED_CLASS)).toBe(true);
    expect(secondCard.classList.contains(VISIBLE_CLASS)).toBe(true);
    expect(secondCard.classList.contains(COLLAPSED_CLASS)).toBe(false);
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

  it("throws initialization error when posts dataset is invalid", () => {
    const { elements } = createSearchDom();
    elements.searchInput.dataset.posts = "{invalid-json";

    const service = createBlogSearchService({ elements });

    expect(() => service.initialize()).toThrow(ServiceInitializationError);
    service.destroy();
  });
});
