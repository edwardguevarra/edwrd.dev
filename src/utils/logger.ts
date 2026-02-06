type LogLevel = "info" | "warn" | "error" | "debug";

export function createLogger(context: string) {
  const log = (
    level: LogLevel,
    message: string,
    contextData?: Record<string, unknown>
  ) => {
    const prefix = `[${context}] ${level.toUpperCase()}`;

    if (level === "error") {
      console.error(prefix, message, contextData);
    } else if (level === "warn") {
      console.warn(prefix, message, contextData);
    } else if (level === "debug") {
      console.debug(prefix, message, contextData);
    } else {
      console.log(prefix, message, contextData);
    }
  };

  return {
    info: (message: string, context?: Record<string, unknown>) =>
      log("info", message, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      log("warn", message, context),
    error: (message: string, context?: Record<string, unknown>) =>
      log("error", message, context),
    debug: (message: string, context?: Record<string, unknown>) =>
      log("debug", message, context),
  };
}
