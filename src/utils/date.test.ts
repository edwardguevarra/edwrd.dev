import { describe, it, expect } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
  it("formats a date as 'January 15, 2024' for en-US locale", () => {
    const date = new Date("2024-01-15");
    expect(formatDate(date)).toBe("January 15, 2024");
  });

  it("formats a date with different month and day", () => {
    const date = new Date("2023-12-31");
    expect(formatDate(date)).toBe("December 31, 2023");
  });

  it("formats leap year date correctly", () => {
    const date = new Date("2024-02-29");
    expect(formatDate(date)).toBe("February 29, 2024");
  });
});
