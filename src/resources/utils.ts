import type { HttpRequestOptions } from "../http/HttpClient.js";
import type { UserContextHeaderParams } from "../interfaces.js";

/**
 * Shared request configuration options exposed across resource methods.
 */
export interface RequestOptions {
  /**
   * Abort controller signal allowing callers to cancel the in-flight HTTP request.
   */
  signal?: AbortSignal;
  /**
   * Overrides the bearer token for a single request when acting on behalf of a different user.
   */
  authToken?: string;
  /**
   * Optional idempotency key supporting safe retries for non-idempotent endpoints.
   */
  idempotencyKey?: string;
  /**
   * Enables callers to opt in or out of the built-in rate limiting logic.
   */
  useRateLimiter?: boolean;
}

/**
 * Extended request options that also accept the optional X-CompanyCam-User header.
 */
export type UserScopedRequestOptions = RequestOptions & UserContextHeaderParams;

/**
 * Create a request configuration for the HTTP client that only contains supported options.
 */
export function buildRequestConfig(
  options?: RequestOptions
): Pick<HttpRequestOptions, "signal" | "authToken" | "idempotencyKey" | "useRateLimiter"> {
  if (!options) {
    return {};
  }

  const config: Pick<
    HttpRequestOptions,
    "signal" | "authToken" | "idempotencyKey" | "useRateLimiter"
  > = {};

  if (options.signal) {
    config.signal = options.signal;
  }
  if (options.authToken) {
    config.authToken = options.authToken;
  }
  if (options.idempotencyKey) {
    config.idempotencyKey = options.idempotencyKey;
  }
  if (options.useRateLimiter !== undefined) {
    config.useRateLimiter = options.useRateLimiter;
  }

  return config;
}

/**
 * Remove undefined and null values from query objects prior to transmission.
 */
export function cleanQueryParameters(
  query?: object
): Record<string, unknown> | undefined {
  if (!query) {
    return undefined;
  }

  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (value === undefined || value === null) {
      continue;
    }
    cleaned[key] = value;
  }

  return Object.keys(cleaned).length ? cleaned : undefined;
}

/**
 * URL encode path parameters in a consistent manner across all resources.
 */
export function encodePathParam(value: string): string {
  return encodeURIComponent(value);
}

/**
 * Split the user-scoped options into request configuration and the optional header value.
 */
export function splitUserScopedOptions(
  options?: UserScopedRequestOptions
): {
  requestOptions?: RequestOptions;
  userContext?: string;
} {
  if (!options) {
    return {};
  }

  const { ["X-CompanyCam-User"]: userContext, ...requestOptions } = options;
  return {
    requestOptions: requestOptions as RequestOptions,
    userContext,
  };
}
