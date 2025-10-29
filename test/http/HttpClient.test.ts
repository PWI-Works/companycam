import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosError, AxiosResponse } from "axios";
import { HttpClient } from "../../src/http/HttpClient.js";
import { APIError } from "../../src/http/Errors.js";
import type { RateLimiter } from "../../src/http/RateLimiter.js";

/**
 * The HTTP client wires axios, retries, and rate limiting together. We mock
 * axios and the rate limiter so each behaviour can be verified in isolation.
 */

const axiosMocks = vi.hoisted(() => {
  const axiosRequest = vi.fn<(config: unknown) => Promise<AxiosResponse>>();
  let lastInstance: {
    defaults: { headers: { common: Record<string, string> } };
    request: typeof axiosRequest;
  } | null = null;

  const createInstance = () => {
    const instance = {
      defaults: { headers: { common: {} as Record<string, string> } },
      request: axiosRequest,
    };
    lastInstance = instance;
    return instance;
  };

  const axiosCreate = vi.fn(createInstance);

  const isAxiosErrorMock = vi.fn((error: unknown) =>
    Boolean((error as { isAxiosError?: boolean })?.isAxiosError)
  );

  return {
    axiosRequest,
    axiosCreate,
    isAxiosErrorMock,
    getLastInstance: () => lastInstance,
    createInstance,
    reset: () => {
      axiosRequest.mockReset();
      axiosCreate.mockReset();
      isAxiosErrorMock.mockReset();
      lastInstance = null;
    },
  };
});

vi.mock("axios", () => ({
  default: { create: axiosMocks.axiosCreate },
  create: axiosMocks.axiosCreate,
  isAxiosError: axiosMocks.isAxiosErrorMock,
}));

const axiosRetryMocks = vi.hoisted(() => ({
  axiosRetryMock: vi.fn(),
  isNetworkErrorMock: vi.fn(() => false),
}));

vi.mock("axios-retry", () => ({
  default: axiosRetryMocks.axiosRetryMock,
  isNetworkError: axiosRetryMocks.isNetworkErrorMock,
}));

type MockRateLimiter = {
  acquire: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
};

const rateLimiterMocks = vi.hoisted(() => {
  const instances: MockRateLimiter[] = [];
  const RateLimiterMock = vi.fn(function RateLimiterMock(this: unknown) {
    const instance: MockRateLimiter = {
      acquire: vi.fn(() => Promise.resolve()),
      dispose: vi.fn(),
    };
    instances.push(instance);
    return instance;
  });

  return { RateLimiterMock, instances };
});

vi.mock("../../src/http/RateLimiter.js", () => ({
  RateLimiter: rateLimiterMocks.RateLimiterMock,
}));

const { axiosRequest, axiosCreate, isAxiosErrorMock, createInstance } =
  axiosMocks;
const { axiosRetryMock, isNetworkErrorMock } = axiosRetryMocks;
const { RateLimiterMock, instances: rateLimiterInstances } = rateLimiterMocks;

describe("HttpClient", () => {
  beforeEach(() => {
    // Reset mocks prior to each test to keep assertions self-contained.
    axiosMocks.reset();
    axiosRetryMock.mockReset();
    isNetworkErrorMock.mockReset();
    rateLimiterInstances.splice(0, rateLimiterInstances.length);
    RateLimiterMock.mockReset();

    axiosCreate.mockImplementation(createInstance);
  });

  it("attaches default headers and honours per-request overrides", async () => {
    // Arrange: configure the client with base headers and a provided rate limiter.
    const acquire = vi.fn(() => Promise.resolve());
    const dispose = vi.fn();
    const limiter = { acquire, dispose } as unknown as RateLimiter;

    axiosRequest.mockResolvedValue({
      status: 200,
      data: {},
      headers: {},
      statusText: "OK",
    } as unknown as AxiosResponse);

    const client = new HttpClient({
      baseURL: "https://api.companycam.com/v2",
      authToken: "base-token",
      defaultHeaders: { "X-Client": "sdk" },
      rateLimiter: limiter,
    });

    // Act: dispatch a request that overrides the auth token, appends headers, and specifies an idempotency key.
    await client.request({
      method: "get",
      url: "/projects",
      headers: {
        "X-Correlation-ID": "abc-123",
        "X-Array": ["one", "two"],
        Skip: undefined,
      },
      authToken: "override-token",
      idempotencyKey: "idem-key",
    });

    // Assert: the request inherits defaults, includes overrides, and acquires the rate limiter token.
    expect(acquire).toHaveBeenCalledTimes(1);
    expect(axiosRequest).toHaveBeenCalledTimes(1);
    const [config] = axiosRequest.mock.calls[0];
    expect((config as any)?.headers).toEqual({
      Accept: "application/json",
      "X-Client": "sdk",
      "X-Correlation-ID": "abc-123",
      "X-Array": "one, two",
      Authorization: "Bearer override-token",
      "Idempotency-Key": "idem-key",
    });
    expect((config as any)?.method).toBe("get");
    expect((config as any)?.url).toBe("/projects");
  });

  it("skips the rate limiter when requested", async () => {
    // Arrange: provide a stubbed limiter so we can ensure acquire is not called.
    const acquire = vi.fn(() => Promise.resolve());
    const limiter = { acquire, dispose: vi.fn() } as unknown as RateLimiter;
    axiosRequest.mockResolvedValue({
      status: 200,
      data: {},
      headers: {},
      statusText: "OK",
    } as unknown as AxiosResponse);

    const client = new HttpClient({ rateLimiter: limiter });

    // Act: execute a request while explicitly disabling rate limiting.
    await client.request({
      method: "delete",
      url: "/projects/1",
      useRateLimiter: false,
    });

    // Assert: the limiter was never touched.
    expect(acquire).not.toHaveBeenCalled();
  });

  it("wraps Axios errors in APIError instances", async () => {
    // Arrange: emit an Axios-like error from the mocked request pipeline.
    const error = {
      isAxiosError: true,
      message: "Request failed",
      response: {
        status: 500,
        statusText: "Server Error",
        data: { errors: ["Internal problem"], code: "server_error" },
        headers: { "x-request-id": "req-789" },
      },
      config: { method: "get", url: "/failing-endpoint" },
      toJSON: () => ({}),
      name: "AxiosError",
    } as unknown as AxiosError;

    axiosRequest.mockRejectedValue(error);

    const client = new HttpClient({
      rateLimiter: {
        acquire: vi.fn(() => Promise.resolve()),
        dispose: vi.fn(),
      } as unknown as RateLimiter,
    });

    // Act & Assert: the thrown error is upgraded to our APIError helper with preserved context.
    let capturedError: APIError | null = null;
    const failingRequest = client
      .request({ method: "get", url: "/failing-endpoint" })
      .catch((err) => {
        capturedError = err as APIError;
        throw err;
      });

    await expect(failingRequest).rejects.toBeInstanceOf(APIError);

    if (capturedError && (capturedError as any) instanceof APIError) {
      const err = capturedError as APIError;
      expect(err).toBeInstanceOf(APIError);
      expect(err.status).toBe(500);
      expect(err.code).toBe("server_error");
      expect(err.requestId).toBe("req-789");
      expect(err.method).toBe("GET");
      expect(err.url).toBe("/failing-endpoint");
    } else {
      throw new Error("Expected APIError to be thrown");
    }
  });

  it("disposes owned rate limiters while leaving externally supplied ones alone", () => {
    // Arrange: constructing without a limiter should create one internally that we can observe through the mock.
    const ownedClient = new HttpClient();
    expect(RateLimiterMock).toHaveBeenCalledTimes(1);
    const [ownedLimiter] = rateLimiterInstances;

    // Arrange: constructing with a limiter should skip internal allocation.
    const externalLimiter = {
      acquire: vi.fn(),
      dispose: vi.fn(),
    } as unknown as RateLimiter;
    const borrowedClient = new HttpClient({ rateLimiter: externalLimiter });

    // Act: disposing both clients should only dispose the owned limiter.
    ownedClient.dispose();
    borrowedClient.dispose();

    expect(ownedLimiter.dispose).toHaveBeenCalledTimes(1);
    expect(externalLimiter.dispose).not.toHaveBeenCalled();
  });

  it("evaluates retry eligibility according to method and status", () => {
    // Arrange: create two clients to compare POST retry behaviour.
    const defaultClient = new HttpClient();
    const postRetryClient = new HttpClient({ retry: { allowPostRetry: true } });

    const serverError = {
      config: { method: "get" },
      response: { status: 500 },
    } as AxiosError;

    const postError = {
      config: { method: "post" },
      response: { status: 500 },
    } as AxiosError;

    const rateLimited = {
      config: { method: "patch" },
      response: { status: 429 },
    } as AxiosError;

    const networkError = {
      config: { method: "delete" },
    } as AxiosError;

    isNetworkErrorMock.mockReturnValue(true);

    // Act & Assert: GET retries on server errors, PATCH retries on 429, POST respects config, network errors retry.
    expect(
      (
        defaultClient as unknown as { shouldRetry(error: AxiosError): boolean }
      ).shouldRetry(serverError)
    ).toBe(true);
    expect(
      (
        defaultClient as unknown as { shouldRetry(error: AxiosError): boolean }
      ).shouldRetry(postError)
    ).toBe(false);
    expect(
      (
        postRetryClient as unknown as {
          shouldRetry(error: AxiosError): boolean;
        }
      ).shouldRetry(postError)
    ).toBe(true);
    expect(
      (
        defaultClient as unknown as { shouldRetry(error: AxiosError): boolean }
      ).shouldRetry(rateLimited)
    ).toBe(true);
    expect(
      (
        defaultClient as unknown as { shouldRetry(error: AxiosError): boolean }
      ).shouldRetry(networkError)
    ).toBe(true);
  });

  it("honours Retry-After headers when computing backoff delays", () => {
    // Arrange: fix Math.random so jitter calculations are deterministic.
    const mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const client = new HttpClient();

    const retryAfterSeconds = {
      response: { headers: { "retry-after": "5" } },
    } as unknown as AxiosError;

    const retryAfterFutureDate = {
      response: {
        headers: { "retry-after": new Date(Date.now() + 3000).toUTCString() },
      },
    } as unknown as AxiosError;

    const noHeader = {} as unknown as AxiosError;

    // Act: evaluate different delay scenarios.
    const delayFromSeconds = (
      client as unknown as {
        computeRetryDelay(retryCount: number, error: AxiosError): number;
      }
    ).computeRetryDelay(1, retryAfterSeconds);
    const delayFromDate = (
      client as unknown as {
        computeRetryDelay(retryCount: number, error: AxiosError): number;
      }
    ).computeRetryDelay(1, retryAfterFutureDate);
    const delayWithoutHeader = (
      client as unknown as {
        computeRetryDelay(retryCount: number, error: AxiosError): number;
      }
    ).computeRetryDelay(3, noHeader);

    // Assert: Retry-After dominates, otherwise exponential backoff with jitter is applied.
    expect(delayFromSeconds).toBe(5000);
    expect(delayFromDate).toBeGreaterThan(0);
    expect(delayFromDate).toBeLessThanOrEqual(8000);
    expect(delayWithoutHeader).toBeGreaterThan(800);
    expect(delayWithoutHeader).toBeLessThanOrEqual(8000);

    mathRandomSpy.mockRestore();
  });
});
