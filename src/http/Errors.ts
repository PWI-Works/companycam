import type { AxiosError } from 'axios';

export interface APIProblem {
  errors?: string[];
  [key: string]: unknown;
}

export interface APIErrorOptions {
  status?: number;
  code?: string;
  problem?: APIProblem | unknown;
  headers?: Record<string, unknown>;
  requestId?: string;
  method?: string;
  url?: string;
  cause?: unknown;
}

export class APIError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly problem?: APIProblem | unknown;
  readonly headers?: Record<string, unknown>;
  readonly requestId?: string;
  readonly method?: string;
  readonly url?: string;

  constructor(message: string, options: APIErrorOptions = {}) {
    super(message);
    this.name = 'APIError';
    this.status = options.status;
    this.code = options.code;
    this.problem = options.problem;
    this.headers = options.headers;
    this.requestId = options.requestId;
    this.method = options.method;
    this.url = options.url;
    if (options.cause) {
      (this as unknown as { cause?: unknown }).cause = options.cause;
    }
  }

  static fromAxios(error: AxiosError): APIError {
    const response = error.response;
    const request = error.config;
    const problem = (response?.data ?? undefined) as APIProblem | undefined;
    const errors = Array.isArray(problem?.errors) ? problem?.errors : undefined;
    const requestId =
      response?.headers?.['x-request-id'] ?? response?.headers?.['x-amzn-requestid'];

    const message =
      errors?.[0] ||
      response?.statusText ||
      error.message ||
      'Unexpected API error';

    return new APIError(message, {
      status: response?.status,
      code: problem && typeof problem === 'object' && 'code' in problem ? (problem as { code?: string }).code : undefined,
      problem,
      headers: response?.headers as Record<string, unknown> | undefined,
      requestId: typeof requestId === 'string' ? requestId : undefined,
      method: request?.method?.toUpperCase(),
      url: request?.url,
      cause: error,
    });
  }
}
