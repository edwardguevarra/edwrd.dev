import type { BlogSearchConfig } from "../../types/shared.types";

export interface BlogSearchPostData {
  id: string;
  title: string;
  tags: string[];
}

export interface BlogSearchElements {
  searchInput: HTMLInputElement;
  postsGrid: HTMLElement;
  noResults: HTMLElement;
}

export interface BlogSearchServiceConfig extends BlogSearchConfig {
  elements: BlogSearchElements;
}
