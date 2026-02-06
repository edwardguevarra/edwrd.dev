import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger } from "../logger";

describe("createLogger", () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    debug: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a logger with context", () => {
    const logger = createLogger("TestContext");
    expect(logger).toBeDefined();
    expect(logger.info).toBeInstanceOf(Function);
    expect(logger.warn).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
    expect(logger.debug).toBeInstanceOf(Function);
  });

  describe("info()", () => {
    it("should call console.log with correct format", () => {
      const logger = createLogger("TestContext");
      logger.info("Test message");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[TestContext] INFO",
        "Test message",
        undefined
      );
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it("should include context data when provided", () => {
      const logger = createLogger("TestContext");
      const contextData = { userId: 123, action: "test" };
      logger.info("Test message", contextData);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[TestContext] INFO",
        "Test message",
        contextData
      );
    });
  });

  describe("warn()", () => {
    it("should call console.warn with correct format", () => {
      const logger = createLogger("TestContext");
      logger.warn("Warning message");

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[TestContext] WARN",
        "Warning message",
        undefined
      );
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it("should include context data when provided", () => {
      const logger = createLogger("TestContext");
      const contextData = { userId: 123, warning: "test" };
      logger.warn("Warning message", contextData);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[TestContext] WARN",
        "Warning message",
        contextData
      );
    });
  });

  describe("error()", () => {
    it("should call console.error with correct format", () => {
      const logger = createLogger("TestContext");
      logger.error("Error message");

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[TestContext] ERROR",
        "Error message",
        undefined
      );
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it("should include context data when provided", () => {
      const logger = createLogger("TestContext");
      const error = new Error("Test error");
      const contextData = { error: error.message };
      logger.error("Error message", contextData);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[TestContext] ERROR",
        "Error message",
        contextData
      );
    });
  });

  describe("debug()", () => {
    it("should call console.debug with correct format", () => {
      const logger = createLogger("TestContext");
      logger.debug("Debug message");

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        "[TestContext] DEBUG",
        "Debug message",
        undefined
      );
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it("should include context data when provided", () => {
      const logger = createLogger("TestContext");
      const contextData = { debug: true, value: 42 };
      logger.debug("Debug message", contextData);

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        "[TestContext] DEBUG",
        "Debug message",
        contextData
      );
    });
  });

  describe("multiple loggers", () => {
    it("should create independent loggers with different contexts", () => {
      const logger1 = createLogger("Context1");
      const logger2 = createLogger("Context2");

      logger1.info("Message 1");
      logger2.warn("Message 2");

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[Context1] INFO",
        "Message 1",
        undefined
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[Context2] WARN",
        "Message 2",
        undefined
      );
    });
  });

  describe("complex context data", () => {
    it("should handle nested objects in context", () => {
      const logger = createLogger("TestContext");
      const nestedContext = {
        user: { id: 1, name: "Test" },
        metadata: { timestamp: 123456789 },
      };
      logger.info("Complex message", nestedContext);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[TestContext] INFO",
        "Complex message",
        nestedContext
      );
    });

    it("should handle arrays in context", () => {
      const logger = createLogger("TestContext");
      const arrayContext = { items: [1, 2, 3], tags: ["a", "b", "c"] };
      logger.info("Array message", arrayContext);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        "[TestContext] INFO",
        "Array message",
        arrayContext
      );
    });

    it("should handle error objects in context", () => {
      const logger = createLogger("TestContext");
      const error = new Error("Test error");
      error.stack = "Error stack trace";
      const errorContext = { error };
      logger.error("Error occurred", errorContext);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[TestContext] ERROR",
        "Error occurred",
        errorContext
      );
    });
  });
});
