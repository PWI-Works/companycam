# CompanyCam TypeScript SDK

[![npm version](https://img.shields.io/npm/v/companycam?color=orange&label=npm)](https://www.npmjs.com/package/companycam)
[![Changelog](https://img.shields.io/badge/Changelog-View-blue)](./CHANGELOG.md)

Welcome to the home of the unofficial [CompanyCam](https://companycam.com/) TypeScript SDK. This project was created to give developers an easy to use SDK for the [CompanyCam API](https://docs.companycam.com/docs/welcome). We are glad you are here and would love your help shaping a dependable, community-driven toolkit.

Our focus is to provide:

- **Accurate coverage of the API** by basing all functionality directly from [CompanyCam's official OpenAPI spec](https://github.com/CompanyCam/openapi-spec)
- **First-class TypeScript ergonomics** so you can enjoy autocompletion, type safety, and a predictable developer experience
- **Clear contribution paths** for anyone who wants to improve the SDK, documentation, or automation

> Note: this project is not officially supported by [CompanyCam](https://companycam.com/). We created it because our organization needed to implement an integration between CompanyCam and our own apps. We hope that you find this useful! Our use case is limited to our own implementation, so there may be issues related to features we aren't using. Please feel free to contribute or report any issues that you find when using this library.

## Installation

This repository is published to [npm](https://www.npmjs.com/) as [companycam](https://www.npmjs.com/package/companycam).

```sh
npm install companycam --save
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

## Basic Usage

All objects and endpoints from the [CompanyCam API Documentation](https://docs.companycam.com/reference) are available for use. Calling them is intuitive and object-oriented.

Sometimes the API needs slightly different fields when creating or updating an object.
Usually, both create and update use only part of the full object's fields.

When that happens, we follow this pattern:

- If **create** and **update** endpoints use the same fields, we define a single `...Mutable` interface and use it for both.
- If field requirements differ, we define two separate interfaces - `...CreatePayload` and `...UpdatePayload` - to clearly show what each one expects.

### Example: Listing all Users with Pagination

```ts
import { createClient, User, PaginationQueryParams } from "companycam";

const client = createClient({
  baseURL: "https://api.companycam.com/v2",
  authToken: process.env.COMPANYCAM_TOKEN,
});

const perPage = 50;
const allUsers: User[] = [];

// Fetch each page until the API returns fewer records than requested.
for (let page = 1; ; page += 1) {
  const query: PaginationQueryParams = { page, per_page: perPage };
  const usersFromQuery = await client.users.list(query);

  allUsers.push(...usersFromQuery);

  // Stop once the most recent page is not full, signaling there are no more results.
  if (usersFromQuery.length < perPage) {
    break;
  }
}

console.log(`Fetched ${allUsers.length} users`);
```

### Example: Creating a User

```ts
import { createClient, User, UserCreatePayload } from "companycam";

// set up the client
const client = createClient({
  baseURL: "https://api.companycam.com/v2",
  authToken: process.env.COMPANYCAM_TOKEN,
});

// Prepare the payload following the POST /users schema.
const payload: UserCreatePayload = {
  first_name: "Shawn",
  last_name: "Spencer",
  email_address: "shawn.spencer@example.com",
  phone_number: "4025551212",
  password: "temporary-password",
  user_role: "standard",
};

// Create the user while optionally attributing the action to another admin account.
const createdUser: User = await client.users.create(payload, {
  "X-CompanyCam-User": "admin@example.com",
});

console.log(createdUser.id);
```

## Working with AI Agents

AI agents make coding fast and efficient. However, many agents struggle to understand the latest npm packages and how to use them correctly.

The ideal solution is to write an MCP server for your package. However, to keep things simple, we've provided the next best option: an agent prompt file designed for working with agents. You can find it at [AGENT_PROMPT.md](AGENT_PROMPT.md).

> Note: This prompt is experimental and results may vary. If you find ways to make it better, please consider [contributing to the project](CONTRIBUTING.md) so others can benefit from your expertise!

## Configuration

`createClient` accepts `ClientOptions`, which mirror the exported `HttpClientConfig`. Key options include:

| Option           | Default                                                          | Description                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseURL`        | _(required)_                                                     | Set this to the server defined by the spec: `https://api.companycam.com/v2`.                                                                                                                                                                                            |
| `authToken`      | _(none)_                                                         | Bearer token required by the `BearerAuth` security scheme declared in the spec.                                                                                                                                                                                         |
| `timeoutMs`      | `30000`                                                          | Per-request timeout in milliseconds. Override to align with your infrastructure.                                                                                                                                                                                        |
| `defaultHeaders` | `{ Accept: "application/json" }`                                 | Additional headers applied to every request.                                                                                                                                                                                                                            |
| `axiosOptions`   | `{}`                                                             | Low-level axios configuration overrides.                                                                                                                                                                                                                                |
| `retry`          | `{ retries: 3, allowPostRetry: false }`                          | Configure automatic retries for network errors, HTTP 408, 429, and 5xx responses. Retries use exponential backoff with a 200 ms base delay, 8 s cap, 20% jitter, and honor `Retry-After` when provided. POST requests are only retried when `allowPostRetry` is `true`. |
| `rateLimiter`    | `new RateLimiter({ tokensPerInterval: 100, intervalMs: 60000 })` | Shared token-bucket limiter that enforces the documented 100 requests per minute throughput. Pass `null` to disable or provide your own limiter instance.                                                                                                               |

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

## Spec-Driven Promise

We do everything we can to implement the entire [OpenAPI spec made public by CompanyCam](https://github.com/CompanyCam/openapi-spec).

- The OpenAPI document `companycam-openapi-spec.yaml` is the single source of truth.
- Generated interfaces in `src/interfaces.ts` and every resource method are rebuilt from the spec on each run.
- No runtime behavior is hand-authored; any divergence should be reported so we can regenerate from the spec.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidance on proposing changes, running tests, commit message expectations, and keeping generated assets in sync with the latest specification.
