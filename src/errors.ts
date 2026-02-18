export class ProcurosError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ProcurosError';
  }
}

export class ProcurosApiError extends ProcurosError {
  readonly status: number;
  readonly method: string;
  readonly path: string;
  readonly body: unknown;

  constructor(
    message: string,
    options: { status: number; method: string; path: string; body: unknown },
  ) {
    super(message);
    this.name = 'ProcurosApiError';
    this.status = options.status;
    this.method = options.method;
    this.path = options.path;
    this.body = options.body;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      method: this.method,
      path: this.path,
      body: this.body,
    };
  }
}

export class ProcurosValidationError extends ProcurosApiError {
  readonly fieldErrors: Record<string, string[]>;
  readonly errorUrl?: string;

  constructor(
    message: string,
    options: {
      status: number;
      method: string;
      path: string;
      body: unknown;
      fieldErrors: Record<string, string[]>;
      errorUrl?: string;
    },
  ) {
    super(message, options);
    this.name = 'ProcurosValidationError';
    this.fieldErrors = options.fieldErrors;
    this.errorUrl = options.errorUrl;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors,
      ...(this.errorUrl !== undefined && { errorUrl: this.errorUrl }),
    };
  }
}

export class ProcurosRateLimitError extends ProcurosApiError {
  readonly retryAfterMs?: number;

  constructor(
    message: string,
    options: {
      status: number;
      method: string;
      path: string;
      body: unknown;
      retryAfterMs?: number;
    },
  ) {
    super(message, options);
    this.name = 'ProcurosRateLimitError';
    this.retryAfterMs = options.retryAfterMs;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ...(this.retryAfterMs !== undefined && { retryAfterMs: this.retryAfterMs }),
    };
  }
}

export class ProcurosNetworkError extends ProcurosError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ProcurosNetworkError';
  }
}

export class ProcurosTimeoutError extends ProcurosError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = 'ProcurosTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuid(value: string, label: string): void {
  if (!UUID_RE.test(value)) {
    throw new ProcurosError(`Invalid UUID for ${label}: "${value}"`);
  }
}
