# CompanyCam TypeScript SDK

Welcome to the home of the unofficial [CompanyCam](https://companycam.com/) TypeScript SDK. This project turns the public OpenAPI specification into a modern, well-typed client that developers can rely on when integrating with the [CompanyCam API](https://docs.companycam.com/docs/welcome). We are glad you are here and would love your help shaping a dependable, community-driven toolkit.

Our focus is to provide:

- **Accurate coverage of the API** by generating everything directly from the published OpenAPI spec.
- **First-class TypeScript ergonomics** so you can enjoy autocompletion, safety, and predictable developer experience.
- **Clear contribution paths** for anyone who wants to improve the SDK, documentation, or automation.

> Note: this project is not officially supported by [CompanyCam](https://companycam.com/). We created it because our organization needed to implement an integration between CompanyCam and our own apps. We hope that you find this useful! Our use case is limited to our own implementation, so there may be issues related to features we aren't using. Please feel free to contribute or report any issues that you find when using this library.

This repository publishes the TypeScript SDK straight from the authoritative `companycam-openapi-spec.yaml`, so the runtime behavior, request shapes, and response typings stay in lockstep with the public specification.

## Installation

```sh
npm install companycam
```

## Quick Start

```ts
import { createClient } from "companycam";

const client = createClient({
  baseURL: "https://api.companycam.com/v2",
  authToken: process.env.COMPANYCAM_TOKEN,
});

const projects = await client.projects.list({ page: 1, per_page: 50 });
console.log(projects.length);
```

## Configuration

`createClient` accepts `ClientOptions`, which mirror the exported `HttpClientConfig`. Key options include:

| Option | Default | Description |
| --- | --- | --- |
| `baseURL` | _(required)_ | Set this to the server defined by the spec: `https://api.companycam.com/v2`. |
| `authToken` | _(none)_ | Bearer token required by the `BearerAuth` security scheme declared in the spec. |
| `timeoutMs` | `30000` | Per-request timeout in milliseconds. Override to align with your infrastructure. |
| `defaultHeaders` | `{ Accept: "application/json" }` | Additional headers applied to every request. |
| `axiosOptions` | `{}` | Low-level axios configuration overrides. |
| `retry` | `{ retries: 3, allowPostRetry: false }` | Configure automatic retries for network errors, HTTP 408, 429, and 5xx responses. Retries use exponential backoff with a 200 ms base delay, 8 s cap, 20% jitter, and honor `Retry-After` when provided. POST requests are only retried when `allowPostRetry` is `true`. |
| `rateLimiter` | `new RateLimiter({ tokensPerInterval: 100, intervalMs: 60000 })` | Shared token-bucket limiter that enforces the documented 100 requests per minute throughput. Pass `null` to disable or provide your own limiter instance. |

Every resource method also accepts optional `RequestOptions` that let you override the bearer token, attach an `AbortSignal`, supply an `Idempotency-Key`, or opt out of rate limiting on a per-call basis. Endpoints that support acting on behalf of another user additionally accept an `X-CompanyCam-User` value via `UserScopedRequestOptions`.

## Error Handling

Non-successful responses are wrapped in an `APIError`. The error exposes:

- `message`: First entry from the spec-defined `Error.errors` array when available, otherwise the HTTP status text.
- `status`: Numeric HTTP status code.
- `code`: String code when supplied by the API payload.
- `problem`: The raw payload, matching the `components.schemas.Error` structure from the spec.
- `headers`: Response headers, including `Retry-After` and request identifiers.
- `requestId`, `method`, `url`: Diagnostic metadata captured from the failed request.

You can catch `APIError` to branch on status, surface structured messages, or record the underlying problem document for debugging.

## Pagination

Every list endpoint in the specification inherits `PaginationQueryParams`, exposing `page` and `per_page` query parameters. Responses return plain arrays; continue pagination by incrementing `page` until the API returns fewer items than requested. Because the spec does not define cursor fields or pagination metadata, the SDK does not infer any additional pagination helpers beyond these query parameters.

## Spec-Derived Guarantee

- The OpenAPI document `companycam-openapi-spec.yaml` is the single source of truth.
- Generated interfaces in `src/interfaces.ts` and every resource method are rebuilt from the spec on each run.
- No runtime behavior is hand-authored; any divergence should be reported so we can regenerate from the spec.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidance on proposing changes, running tests, commit message expectations, and keeping generated assets in sync with the latest specification.
