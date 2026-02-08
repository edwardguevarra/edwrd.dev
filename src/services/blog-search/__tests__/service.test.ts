import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBlogSearchService } from "../index";
import type { BlogSearchElements } from "../types";
import {
  DOMElementNotFoundError,
  ServiceInitializationError,
} from "../../../errors/types";

const STYLE_ELEMENT_ID = "blog-search-service-style";

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

    vi.advanceTimersByTime(300);
    vi.advanceTimersByTime(300);

    expect(firstCard.style.display).toBe("none");
    expect(secondCard.style.display).toBe("block");
    expect(noResults.classList.contains("hidden")).toBe(true);
    expect(new URL(window.location.href).searchParams.get("q")).toBe("testing");

    service.destroy();
  });

  it("shows no results message when no posts match", () => {
    const { elements, searchInput, firstCard, secondCard, noResults } =
      createSearchDom();
    const service = createBlogSearchService({ elements });

    service.initialize();

    searchInput.value = "no-match";
    searchInput.dispatchEvent(new Event("input"));

    vi.advanceTimersByTime(300);
    vi.advanceTimersByTime(300);

    expect(firstCard.style.display).toBe("none");
    expect(secondCard.style.display).toBe("none");
    expect(noResults.classList.contains("hidden")).toBe(false);

    service.destroy();
  });

  it("loads search term from URL during initialization", () => {
    const { elements, searchInput, firstCard, secondCard } = createSearchDom();
    window.history.replaceState({}, "", "/blog?q=astro");

    const service = createBlogSearchService({ elements });
    service.initialize();

    vi.advanceTimersByTime(300);

    expect(searchInput.value).toBe("astro");
    expect(firstCard.style.display).toBe("block");
    expect(secondCard.style.display).toBe("none");

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
