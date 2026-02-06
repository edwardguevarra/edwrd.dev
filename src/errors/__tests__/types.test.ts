import { describe, it, expect } from "vitest";
import {
  ServiceInitializationError,
  DOMElementNotFoundError,
  ConfigurationError,
  ObserverError,
} from "../types";

describe("Error Types", () => {
  describe("ServiceInitializationError", () => {
    it("should create error with service name and message", () => {
      const error = new ServiceInitializationError(
        "TestService",
        "Test message"
      );

      expect(error.name).toBe("ServiceInitializationError");
      expect(error.message).toBe("[TestService] Test message");
    });

    it("should include cause when provided", () => {
      const cause = new Error("Underlying error");
      const error = new ServiceInitializationError(
        "TestService",
        "Test message",
        cause
      );

      expect(error.cause).toBe(cause);
    });

    it("should not have cause when not provided", () => {
      const error = new ServiceInitializationError(
        "TestService",
        "Test message"
      );

      expect(error.cause).toBeUndefined();
    });
  });

  describe("DOMElementNotFoundError", () => {
    it("should create error with element name", () => {
      const error = new DOMElementNotFoundError("testElement");

      expect(error.name).toBe("DOMElementNotFoundError");
      expect(error.message).toBe("Required DOM element not found: testElement");
    });
  });

  describe("ConfigurationError", () => {
    it("should create error with message", () => {
      const error = new ConfigurationError("Invalid configuration");

      expect(error.name).toBe("ConfigurationError");
      expect(error.message).toBe("Configuration error: Invalid configuration");
    });

    it("should include cause when provided", () => {
      const cause = new Error("Underlying error");
      const error = new ConfigurationError("Invalid configuration", cause);

      expect(error.cause).toBe(cause);
    });

    it("should not have cause when not provided", () => {
      const error = new ConfigurationError("Invalid configuration");

      expect(error.cause).toBeUndefined();
    });
  });

  describe("ObserverError", () => {
    it("should create error with operation and element", () => {
      const element = document.createElement("div");
      const error = new ObserverError("observe", element);

      expect(error.name).toBe("ObserverError");
      expect(error.message).toBe("Observer observe failed for element: DIV");
    });

    it("should include cause when provided", () => {
      const element = document.createElement("div");
      const cause = new Error("Underlying error");
      const error = new ObserverError("observe", element, cause);

      expect(error.cause).toBe(cause);
    });

    it("should not have cause when not provided", () => {
      const element = document.createElement("div");
      const error = new ObserverError("observe", element);

      expect(error.cause).toBeUndefined();
    });
  });
});
