import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  isAxiosError,
} from "axios";
import axiosRetry, { isNetworkError } from "axios-retry";
import type { AxiosError } from "axios";
import { RateLimiter } from "./RateLimiter.js";
import { APIError } from "./Errors.js";

/**
 * Controls automatic retry behavior applied to outgoing requests.
 */
export interface RetryOptions {
  /**
   * Maximum retry attempts. Defaults to 3.
   */
  retries?: number;
  /**
   * Allow retries for POST requests. Disabled by default.
   */
  allowPostRetry?: boolean;
  /**
   * Hook invoked prior to an automatic retry attempt.
   */
  onRetry?: (
    retryCount: number,
    error: AxiosError,
    requestConfig: AxiosRequestConfig
  ) => void;
}

/**
 * Configuration accepted by {@link HttpClient}. These options align with the runtime guarantees
 * described in the SDK README (base URL, bearer token, timeout, retries, and rate limiting).
 */
export interface HttpClientConfig {
  baseURL?: string;
  timeoutMs?: number;
  authToken?: string;
  defaultHeaders?: Record<string, string>;
  axiosOptions?: AxiosRequestConfig;
  retry?: RetryOptions;
  rateLimiter?: RateLimiter | null;
}

/**
 * Per-request overrides that extend the underlying axios request configuration.
 */
export interface HttpRequestOptions<T = unknown> extends AxiosRequestConfig<T> {
  /**
   * Override the bearer token for this request.
   */
  authToken?: string;
  /**
   * Include an Idempotency-Key header to support safe retries for non-idempotent verbs.
   */
  idempotencyKey?: string;
  /**
   * Skip acquiring a rate-limiter token for this request.
   */
  useRateLimiter?: boolean;
}

const IDEMPOTENT_METHODS = new Set(["GET", "PUT", "PATCH", "DELETE"]);
const BASE_DELAY_MS = 200;
const MAX_DELAY_MS = 8_000;

/**
 * HTTP abstraction that layers CompanyCam specific defaults - timeouts, retries, rate limiting,
 * and bearer authentication - on top of axios.
 */
export class HttpClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly rateLimiter: RateLimiter | null;
  private readonly ownsRateLimiter: boolean;
  private readonly defaultHeaders: Record<string, string>;
  private readonly allowPostRetry: boolean;
  private readonly authToken?: string;

  /**
   * Create a new HTTP client instance.
   *
   * @param config Optional overrides for base URL, timeout, bearer token, retry policy, and rate limiter.
   */
  constructor(config: HttpClientConfig = {}) {
    this.authToken = config.authToken;

    this.defaultHeaders = {
      Accept: "application/json",
      ...(config.defaultHeaders ?? {}),
    };

    const timeout = config.timeoutMs ?? 30_000;
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout,
      ...config.axiosOptions,
    });

    Object.assign(
      this.axiosInstance.defaults.headers.common,
      this.defaultHeaders
    );
    if (this.authToken) {
      this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${this.authToken}`;
    }

    const retryConfig = config.retry ?? {};
    this.allowPostRetry = retryConfig.allowPostRetry ?? false;

    axiosRetry(this.axiosInstance, {
      retries: retryConfig.retries ?? 3,
      shouldResetTimeout: true,
      retryCondition: (error) => this.shouldRetry(error),
      retryDelay: (retryCount, error) =>
        this.computeRetryDelay(retryCount, error),
      onRetry: retryConfig.onRetry,
    });

    if (config.rateLimiter === null) {
      this.rateLimiter = null;
      this.ownsRateLimiter = false;
    } else if (config.rateLimiter) {
      this.rateLimiter = config.rateLimiter;
      this.ownsRateLimiter = false;
    } else {
      this.rateLimiter = new RateLimiter();
      this.ownsRateLimiter = true;
    }
  }

  /**
   * Perform an HTTP request with the configured defaults and return the raw axios response.
   *
   * @param options Axios request configuration along with SDK-specific overrides such as
   * bearer token overrides, idempotency keys, and rate-limiter hints.
   * @returns The axios response object containing the typed payload.
   * @throws {APIError} When the underlying request fails with a non-success status code.
   */
  async request<T = unknown, D = unknown>(
    options: HttpRequestOptions<D>
  ): Promise<AxiosResponse<T>> {
    const useLimiter = options.useRateLimiter ?? true;
    const signal = options.signal;

    if (useLimiter && this.rateLimiter) {
      await this.rateLimiter.acquire(signal);
    }

    const requestConfig = this.prepareRequestConfig(options);

    try {
      return await this.axiosInstance.request<T, AxiosResponse<T>, D>(
        requestConfig
      );
    } catch (error) {
      if (isAxiosError(error)) {
        throw APIError.fromAxios(error);
      }
      throw error;
    }
  }

  /**
   * Dispose of owned resources such as the internal rate limiter.
   */
  dispose(): void {
    if (this.ownsRateLimiter) {
      this.rateLimiter?.dispose();
    }
  }

  private prepareRequestConfig<D>(
    options: HttpRequestOptions<D>
  ): AxiosRequestConfig<D> {
    const {
      authToken,
      idempotencyKey,
      useRateLimiter,
      headers,
      ...axiosConfig
    } = options;

    const mergedHeaders: Record<string, string> = { ...this.defaultHeaders };

    if (headers) {
      for (const [key, value] of Object.entries(
        headers as Record<string, unknown>
      )) {
        if (value === undefined || value === null) {
          continue;
        }
        mergedHeaders[key] = Array.isArray(value)
          ? value.join(", ")
          : String(value);
      }
    }

    const token = authToken ?? this.authToken;
    if (token) {
      mergedHeaders.Authorization = `Bearer ${token}`;
    }
    if (idempotencyKey) {
      mergedHeaders["Idempotency-Key"] = idempotencyKey;
    }

    return {
      ...axiosConfig,
      headers: mergedHeaders,
    };
  }

  private shouldRetry(error: AxiosError): boolean {
    const method = error.config?.method?.toUpperCase();
    const status = error.response?.status;

    const isMethodRetryable =
      !method ||
      IDEMPOTENT_METHODS.has(method) ||
      (this.allowPostRetry && method === "POST");

    if (!isMethodRetryable) {
      return false;
    }

    if (
      status === 408 ||
      status === 429 ||
      (status !== undefined && status >= 500)
    ) {
      return true;
    }

    return isNetworkError(error);
  }

  private computeRetryDelay(retryCount: number, error: AxiosError): number {
    const retryAfter = this.getRetryAfterDelay(error);
    if (retryAfter !== null) {
      return Math.min(retryAfter, MAX_DELAY_MS);
    }

    const exponential = Math.min(
      MAX_DELAY_MS,
      BASE_DELAY_MS * 2 ** Math.max(0, retryCount - 1)
    );
    const jitter = Math.random() * exponential * 0.2;
    return exponential + jitter;
  }

  private getRetryAfterDelay(error: AxiosError): number | null {
    const header = error.response?.headers?.["retry-after"];
    if (!header) {
      return null;
    }

    const headerValue = Array.isArray(header) ? header[0] : header;
    if (!headerValue) {
      return null;
    }

    const seconds = Number(headerValue);
    if (Number.isFinite(seconds)) {
      return Math.max(0, seconds * 1000);
    }

    const date = Date.parse(headerValue);
    if (Number.isNaN(date)) {
      return null;
    }

    return Math.max(0, date - Date.now());
  }
}
