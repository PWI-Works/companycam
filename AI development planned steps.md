# AI Development Planned Steps

The following Codex (or equivalent agent) prompt blocks keep every run aligned with the workflows defined in `agents.md`. Each run must read `companycam-openapi-spec.yaml` directly from the repository and must either write new unit tests or confirm that existing tests still pass (`npm test`).

---

## Run 1 -- Interfaces

**SYSTEM**  
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**  
Use `companycam-openapi-spec.yaml` from this repository as the sole source of truth. Generate:

- `src/interfaces.ts` -- exported TypeScript interfaces matching the spec components and the request/response payloads the SDK exposes.

Requirements:

- Resolve `$ref` links and reuse shared schemas.
- Interfaces only (no standalone type aliases); use PascalCase.
- Model `oneOf`, `anyOf`, `allOf`, and `nullable` exactly.
- Include required vs. optional properties.
- Preserve documentation by emitting concise JSDoc pulled from the spec.
- After writing files, run or verify `npm test` so unit coverage remains valid.

---

## Run 2 -- HTTP Runtime (axios + axios-retry + limiter + errors)

**SYSTEM**  
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**  
Use `companycam-openapi-spec.yaml` for context on auth, rate limits, and error schemas. Generate or update:

- `src/http/RateLimiter.ts` -- token-bucket limiter (100 requests/minute default) with abort support.
- `src/http/Errors.ts` -- `APIError`, `APIProblem`, and helpers mirroring the spec's error payload.
- `src/http/HttpClient.ts` -- axios transport configured with axios-retry, honoring Retry-After, idempotency, and default timeouts.
- `src/index.ts` -- re-export the HTTP utilities and interfaces.

Guidelines:

- Retry on network errors plus HTTP 408, 429, and 5xx with exponential backoff (base 200 ms, cap 8000 ms, jitter, Retry-After respected).
- Treat GET/PUT/PATCH/DELETE as idempotent; only retry POST when explicitly enabled.
- Keep output ESM-compatible and strict TypeScript.
- After changes, run or reaffirm `npm test`.

---

## Run 3 -- Resource Client Library

**SYSTEM**  
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**  
Using `companycam-openapi-spec.yaml`, the generated `src/interfaces.ts`, and the HTTP runtime utilities:

- Generate resource classes under `src/resources/<Domain>.ts`, grouping endpoints by the business entity they operate on (for example `Users`, `Companies`, `Projects`, `Photos`, `Documents`). Keep related sub-resources together so the resulting API feels natural (e.g., project collaborators, assignees, notes).
- Method signatures must accept the minimal ergonomic input that maps to the generated interfaces. Prefer referencing existing interface shapes (or composing them) so callers can pass domain objects directly. Optional parameters should remain optional, but the method should support them when needed (for example, optional query filters). Avoid forcing boilerplate wrappers when an interface already represents the necessary data.
- Implement `src/client.ts` exposing a `createClient(options)` factory that configures `HttpClient`, instantiates each resource, and wires them together.
- Update `src/index.ts` exports so SDK consumers can import the client factory, resource classes, and interfaces.
- Ensure path parameters are URL encoded, only documented query/headers are sent, and errors surface through `APIError`.
- Identify shared logic (for example, pagination helpers, parameter builders, serialization) and extract reusable utilities so method bodies stay slim. Favor intuitive, object-oriented entry points such as `client.projects.assignees.add(...)` or `client.photos.tags.remove(...)` that mirror how customers think about the API.
- When the resources are generated or updated, run `npm test` to confirm the library remains stable (or document why it could not be executed).

---

## Run 4 -- Documentation & Developer Experience

**SYSTEM**  
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**  
Using the current repository state and `companycam-openapi-spec.yaml`:

- Refresh README content to describe the SDK purpose, configuration (base URL, auth token, timeout, retry knobs, rate limiting), error handling (`APIError`), pagination behavior defined in the spec, and the guarantee that code is spec-derived.
- Touch up JSDoc on public classes and methods for clarity (summary, key params, return values, error notes).
- Ensure contribution docs reference the requirement to add or verify tests (`npm test`) for every change.
- Confirm the test suite passes before concluding (`npm test`).

---

## Run 5 -- Validation & Housekeeping

**SYSTEM**  
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**  
Before handing work back:

- Re-read `agents.md` to confirm compliance (spec-first, no inferred behavior, mandatory test verification).
- Regenerate any spec-derived artifacts that became stale during earlier runs.
- Execute `npm test` and address failures; document skipped checks if something blocks the run.
- Summarize changes succinctly for reviewers, including the testing status.
