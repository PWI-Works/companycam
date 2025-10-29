import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RateLimiter } from "../../src/http/RateLimiter.js";
import type { AbortSignalLike } from "../../src/http/RateLimiter.js";

/**
 * Rate limiter behaviour is core to protecting the API. These tests focus on
 * token acquisition, queuing behaviour, abort handling, and clean disposal.
 */
describe("RateLimiter", () => {
  beforeEach(() => {
    // Use mocked timers by default; individual tests will opt into them as needed.
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Always restore timers to avoid bleeding intervals into neighbouring tests.
    vi.useRealTimers();
  });

  it("grants available tokens immediately", async () => {
    // Arrange: start with multiple tokens so the first acquisition should resolve synchronously.
    const limiter = new RateLimiter({ tokensPerInterval: 2, intervalMs: 1000 });

    // Act & Assert: the promise resolves without waiting for the refill cycle.
    await expect(limiter.acquire()).resolves.toBeUndefined();

    limiter.dispose();
  });

  it("queues requests when tokens are exhausted and releases them after refill", async () => {
    // Arrange: configure a single-token bucket so that only one request succeeds immediately.
    const limiter = new RateLimiter({ tokensPerInterval: 1, intervalMs: 200 });

    await limiter.acquire();
    const secondAcquisition = limiter.acquire();

    // Act: advance timers far enough for the internal refill loop to run once.
    await vi.advanceTimersByTimeAsync(200);

    // Assert: the queued request now resolves because a token became available.
    await expect(secondAcquisition).resolves.toBeUndefined();

    limiter.dispose();
  });

  it("respects abort signals supplied before enqueueing", async () => {
    // Arrange: configure an already-aborted signal to simulate cancelled work.
    const controller = new AbortController();
    controller.abort();

    const limiter = new RateLimiter({ tokensPerInterval: 1, intervalMs: 1000 });

    // Act & Assert: attempting to acquire with an aborted signal fails instantly.
    await expect(
      limiter.acquire(controller.signal as unknown as AbortSignalLike)
    ).rejects.toMatchObject({
      name: "AbortError",
      message: "Operation aborted",
    });

    limiter.dispose();
  });

  it("removes queued requests when their abort signal fires", async () => {
    // Arrange: exhaust the single token and enqueue another request with a cancellable signal.
    const limiter = new RateLimiter({ tokensPerInterval: 1, intervalMs: 500 });
    await limiter.acquire();

    const controller = new AbortController();
    const queuedAttempt = limiter.acquire(
      controller.signal as unknown as AbortSignalLike
    );

    // Act: abort prior to the next refill to mimic caller cancellation.
    controller.abort();

    // Assert: the queued promise rejects because the rate limiter clears the cancelled entry.
    await expect(queuedAttempt).rejects.toMatchObject({
      name: "AbortError",
      message: "Operation aborted",
    });

    limiter.dispose();
  });

  it("rejects pending requests when disposed", async () => {
    // Arrange: exhaust the only available token so the next request queues up.
    const limiter = new RateLimiter({ tokensPerInterval: 1, intervalMs: 500 });

    await limiter.acquire();
    const pending = limiter.acquire();

    // Act: disposing the limiter should flush the queue.
    limiter.dispose();

    // Assert: the queued promise fails with a disposal error.
    await expect(pending).rejects.toThrowError("Rate limiter disposed");
  });
});
