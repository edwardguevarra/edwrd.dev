export class ServiceInitializationError extends Error {
  cause?: unknown;

  constructor(serviceName: string, message: string, cause?: unknown) {
    super(`[${serviceName}] ${message}`);
    this.name = "ServiceInitializationError";
    this.cause = cause;
  }
}

export class DOMElementNotFoundError extends Error {
  constructor(elementName: string) {
    super(`Required DOM element not found: ${elementName}`);
    this.name = "DOMElementNotFoundError";
  }
}

export class ConfigurationError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(`Configuration error: ${message}`);
    this.name = "ConfigurationError";
    this.cause = cause;
  }
}

export class ObserverError extends Error {
  cause?: unknown;

  constructor(operation: string, element: Element, cause?: unknown) {
    super(`Observer ${operation} failed for element: ${element.tagName}`);
    this.name = "ObserverError";
    this.cause = cause;
  }
}
