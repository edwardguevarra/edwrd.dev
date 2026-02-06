import { test, expect } from "@playwright/test";

test.describe("Scroll Animations", () => {
  test("homepage sections animate on scroll", async ({ page }) => {
    await page.goto("/");

    const aboutSection = page.locator("#about h2[data-animate]");
    const projectsSection = page.locator("#projects h2[data-animate]");

    await aboutSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const aboutAnimateClass = await aboutSection.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(aboutAnimateClass).toBe(true);

    await projectsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const projectsAnimateClass = await projectsSection.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(projectsAnimateClass).toBe(true);
  });

  test("elements already in viewport animate on page load", async ({
    page,
  }) => {
    await page.goto("/");

    const heroTitle = page.locator("h1[data-animate]");

    await page.waitForTimeout(200);

    const heroAnimateClass = await heroTitle.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(heroAnimateClass).toBe(true);
  });

  test("blog index page animates post cards", async ({ page }) => {
    await page.goto("/blog");

    const firstPostCard = page.locator("a[data-post-id]").first();
    await firstPostCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const cardAnimateClass = await firstPostCard.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(cardAnimateClass).toBe(true);
  });

  test("blog post page animates article content", async ({ page }) => {
    await page.goto("/blog/how-i-use-cursor-ide/");

    const article = page.locator("article[data-animate]");
    await expect(article).toBeVisible();

    const articleAnimateClass = await article.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(articleAnimateClass).toBe(true);
  });

  test("respects reduced motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    await page.goto("/");

    const heroTitle = page.locator("h1[data-animate]");
    await page.waitForTimeout(100);

    const heroOpacity = await heroTitle.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });

    expect(heroOpacity).toBe("1");

    const heroTransform = await heroTitle.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    expect(heroTransform).toBe("none");
  });

  test("animations work with rapid scrolling", async ({ page }) => {
    await page.goto("/");

    const aboutTitle = page.locator("#about h2[data-animate]");
    const projectsTitle = page.locator("#projects h2[data-animate]");

    await aboutTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(50);

    await projectsTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(50);

    await aboutTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const aboutAnimateClass = await aboutTitle.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    const projectsAnimateClass = await projectsTitle.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );

    expect(aboutAnimateClass).toBe(true);
    expect(projectsAnimateClass).toBe(true);
  });

  test("no console errors related to scroll animations", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    await page.goto("/");
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(500);

    const animationErrors = errors.filter(
      (err) =>
        err.toLowerCase().includes("animation") ||
        err.toLowerCase().includes("observer") ||
        err.toLowerCase().includes("scroll")
    );

    expect(animationErrors).toHaveLength(0);
  });

  test("scroll animation manager script is loaded", async ({ page }) => {
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    const scriptLoaded = await page.evaluate(() => {
      return document.querySelector('script[src*="scroll-animation"]') !== null;
    });

    expect(scriptLoaded).toBe(true);
  });

  test("multiple elements on same page animate correctly", async ({ page }) => {
    await page.goto("/");

    const animatedElements = page.locator("[data-animate]");

    const count = await animatedElements.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = animatedElements.nth(i);
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(200);

    let animatedCount = 0;
    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = animatedElements.nth(i);
      const hasClass = await element.evaluate((el) =>
        el.classList.contains("animate-on-scroll")
      );
      if (hasClass) animatedCount++;
    }

    expect(animatedCount).toBeGreaterThan(0);
  });

  test("animations are idempotent - multiple scrolls don't cause issues", async ({
    page,
  }) => {
    await page.goto("/");

    const aboutTitle = page.locator("#about h2[data-animate]");

    await aboutTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const firstAnimateClass = await aboutTitle.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(firstAnimateClass).toBe(true);

    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(100);
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(300);

    const secondAnimateClass = await aboutTitle.evaluate((el) =>
      el.classList.contains("animate-on-scroll")
    );
    expect(secondAnimateClass).toBe(true);
  });
});
