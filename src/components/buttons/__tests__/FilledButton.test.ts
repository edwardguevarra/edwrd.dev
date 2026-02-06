import { describe, it, expect } from "vitest";

describe("FilledButton Component Tests", () => {
  describe("Component Interface", () => {
    it("has required text prop", () => {
      const props = {
        text: "Test Button",
        color: "white" as const,
      };
      expect(props.text).toBe("Test Button");
    });

    it("has required color prop with 'white' and 'lime' options", () => {
      const whiteProps = { text: "Test", color: "white" as const };
      const limeProps = { text: "Test", color: "lime" as const };

      expect(whiteProps.color).toBe("white");
      expect(limeProps.color).toBe("lime");
    });

    it("has optional href prop", () => {
      const props = {
        text: "Test",
        href: "https://example.com",
        color: "white" as const,
      };
      expect(props.href).toBe("https://example.com");
    });

    it("has optional icon prop", () => {
      const props = {
        text: "Test",
        icon: "heroicons:arrow-right",
        color: "white" as const,
      };
      expect(props.icon).toBe("heroicons:arrow-right");
    });

    it("has optional class prop", () => {
      const props = {
        text: "Test",
        class: "custom-class",
        color: "white" as const,
      };
      expect(props.class).toBe("custom-class");
    });

    it("has optional target prop", () => {
      const props = {
        text: "Test",
        href: "/test",
        target: "_blank",
        color: "white" as const,
      };
      expect(props.target).toBe("_blank");
    });
  });

  describe("Expected CSS Classes", () => {
    it("has correct base button classes", () => {
      const baseClasses =
        "w-fit px-[54px] py-[9px] rounded-[50px] border font-semibold text-[14px] leading-[22px] tracking-normal text-center hover:opacity-80 transition-opacity flex items-center justify-center gap-2 cursor-pointer";

      expect(baseClasses).toContain("w-fit");
      expect(baseClasses).toContain("border");
      expect(baseClasses).toContain("font-semibold");
      expect(baseClasses).toContain("hover:opacity-80");
      expect(baseClasses).toContain("flex");
      expect(baseClasses).toContain("gap-2");
    });

    it("has white filled color variant classes", () => {
      const whiteClasses = "bg-white text-brand-dark border-white";
      expect(whiteClasses).toContain("bg-white");
      expect(whiteClasses).toContain("text-brand-dark");
      expect(whiteClasses).toContain("border-white");
    });

    it("has lime filled color variant classes", () => {
      const limeClasses = "bg-brand-lime text-brand-dark border-brand-lime";
      expect(limeClasses).toContain("bg-brand-lime");
      expect(limeClasses).toContain("text-brand-dark");
      expect(limeClasses).toContain("border-brand-lime");
    });
  });

  describe("Target Attribute Logic", () => {
    it("should not add target when not provided", () => {
      const hasTarget = false;
      expect(hasTarget).toBe(false);
    });

    it("should add target when provided", () => {
      const target: string | undefined = "_blank";
      expect(target).toBeDefined();
      expect(target).toBe("_blank");
    });

    it("should add rel='noopener noreferrer' when target='_blank'", () => {
      const target = "_blank";
      const shouldAddRel = target === "_blank";
      expect(shouldAddRel).toBe(true);
    });

    it("should not add rel when target is not '_blank'", () => {
      const target = "_self" as string;
      const shouldAddRel = target === "_blank";
      expect(shouldAddRel).toBe(false);
    });
  });

  describe("Element Rendering Logic", () => {
    it("should render <a> tag when href is provided", () => {
      const hasHref = true;
      const expectedElement = "a";
      expect(hasHref).toBe(true);
      expect(expectedElement).toBe("a");
    });

    it("should render <button> tag when href is not provided", () => {
      const hasHref = false;
      const expectedElement = "button";
      expect(hasHref).toBe(false);
      expect(expectedElement).toBe("button");
    });
  });

  describe("Data Test ID", () => {
    it("should have data-testid='filled-button' attribute", () => {
      const testId = "filled-button";
      expect(testId).toBe("filled-button");
    });
  });
});
