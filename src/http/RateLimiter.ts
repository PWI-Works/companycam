export type AbortHandler = () => void;

export interface AbortSignalLike {
  readonly aborted: boolean;
  addEventListener?: (
    type: "abort",
    listener: AbortHandler,
    options?: { once?: boolean }
  ) => void;
  removeEventListener?: (type: "abort", listener: AbortHandler) => void;
  onabort?: AbortHandler | null;
}

/**
 * Options controlling the shared token bucket limiter.
 */
export interface RateLimiterOptions {
  /**
   * Maximum number of tokens that can be consumed within a full interval.
   * Defaults to 100 requests per interval.
   */
  tokensPerInterval?: number;
  /**
   * Duration of the interval in milliseconds. Defaults to 60 seconds.
   */
  intervalMs?: number;
}

interface PendingRequest {
  resolve: () => void;
  reject: (reason?: unknown) => void;
  signal?: AbortSignalLike;
}

/**
 * Basic token-bucket rate limiter with FIFO queuing and optional abort support.
 * Defaults enforce the 100 requests per minute guidance required by the SDK.
 */
export class RateLimiter {
  private readonly tokensPerInterval: number;
  private readonly intervalMs: number;
  private readonly refillInterval: number;
  private tokens: number;
  private readonly queue: PendingRequest[] = [];
  private refillHandle: ReturnType<typeof setInterval>;

  /**
   * Create a token bucket limiter.
   *
   * @param options Override the bucket size or interval duration.
   */
  constructor(options: RateLimiterOptions = {}) {
    this.tokensPerInterval = Math.max(1, options.tokensPerInterval ?? 100);
    this.intervalMs = Math.max(1, options.intervalMs ?? 60_000);
    this.tokens = this.tokensPerInterval;
    this.refillInterval = this.intervalMs / this.tokensPerInterval;
    this.refillHandle = setInterval(() => this.refill(), this.refillInterval);
    // Avoid keeping Node.js event loop alive if supported.
    (this.refillHandle as unknown as { unref?: () => void }).unref?.();
  }

  /**
   * Acquire a single token before proceeding.
   * The returned promise resolves when a token is allocated.
   *
   * @param signal Optional abort signal used to cancel the wait.
   * @returns Promise that resolves once a token is granted.
   * @throws {Error} Rejects with an `AbortError` if the signal aborts before a token is available.
   */
  acquire(signal?: AbortSignalLike): Promise<void> {
    if (signal?.aborted) {
      return Promise.reject(createAbortError());
    }

    if (this.tokens > 0) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const pending: PendingRequest = {
        resolve: () => resolve(),
        reject,
        signal,
      };

      const onAbort = () => {
        this.removeFromQueue(pending);
        reject(createAbortError());
      };

      const detachAbort = attachAbortListener(signal, onAbort);

      pending.resolve = () => {
        detachAbort?.();
        resolve();
      };

      this.queue.push(pending);
    });
  }

  /**
   * Stop the internal refill timer and clear queued waiters.
   *
   * Rejects all pending acquirers with a disposal error so callers can release resources gracefully.
   */
  dispose(): void {
    clearInterval(this.refillHandle);
    while (this.queue.length > 0) {
      const pending = this.queue.shift();
      pending?.reject(new Error("Rate limiter disposed"));
    }
  }

  private refill(): void {
    if (this.tokens < this.tokensPerInterval) {
      this.tokens += 1;
    }

    while (this.tokens > 0 && this.queue.length > 0) {
      const pending = this.queue.shift();
      if (!pending) {
        break;
      }

      if (pending.signal?.aborted) {
        pending.reject(createAbortError());
        continue;
      }

      this.tokens -= 1;
      pending.resolve();
    }

    if (this.tokens > this.tokensPerInterval) {
      this.tokens = this.tokensPerInterval;
    }
  }

  private removeFromQueue(pending: PendingRequest): void {
    const index = this.queue.indexOf(pending);
    if (index >= 0) {
      this.queue.splice(index, 1);
    }
  }
}

function createAbortError(): Error {
  const error = new Error("Operation aborted");
  error.name = "AbortError";
  return error;
}

function attachAbortListener(
  signal: AbortSignalLike | undefined,
  handler: AbortHandler
): (() => void) | undefined {
  if (!signal) {
    return undefined;
  }

  if (typeof signal.addEventListener === "function") {
    signal.addEventListener("abort", handler, { once: true });
    return () => signal.removeEventListener?.("abort", handler);
  }

  if ("onabort" in signal) {
    const previous = signal.onabort;
    signal.onabort = () => {
      handler();
      if (typeof previous === "function") {
        previous.call(signal);
      }
    };
    return () => {
      signal.onabort = previous ?? null;
    };
  }

  return undefined;
}
