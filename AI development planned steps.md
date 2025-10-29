Here are the four Codex (or equivalent agent) prompt blocks updated so the agent automatically reads and uses **`companycam-openapi-spec.yaml`** from the repository—no need for you to paste or upload the spec.
The wording assumes the repo includes both `companycam-openapi-spec.yaml` and `agents.md`.

---

## 🟩 Run 1 — Types & Manifest

**SYSTEM**
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**
Use the file `companycam-openapi-spec.yaml` from this repository as your only source of truth.
Generate the following:

* `src/types.ts` — TypeScript interfaces and types for all schemas, parameters, and request/response bodies.
* `src/manifest.json` — normalized operation metadata (`id`, `tag`, `method`, `path`, `params`, `requestBodyType`, `responseType`, `successStatus`, `errorStatuses`, etc.).

Requirements:

* Resolve `$ref` links; reuse shared schemas.
* Interfaces → PascalCase; exported.
* Include `required` flags.
* Handle `oneOf`, `anyOf`, `allOf`, and `nullable` accurately.
* Choose the primary 2xx success response; record others as errors.
* Output only these two files.

---

## 🟩 Run 2 — Core Runtime (axios + axios-retry + Limiter + Errors)

**SYSTEM**
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**
Use `companycam-openapi-spec.yaml` for context on rate limits, auth, and error schema.
Generate:

* `src/http/RateLimiter.ts` — token-bucket limiter (≈100 req/min, queue ok)
* `src/http/Errors.ts` — `APIError`, `APIProblem` types
* `src/http/HttpClient.ts` — HTTP transport built on `axios` and `axios-retry`
* `src/index.ts` — exports

Rules:

* Use `axios` for transport; `axios-retry` for retries.
* Retry on network / 408 / 429 / 5xx.
* Exponential backoff with jitter (base 200 ms, cap 8000 ms); honor `Retry-After`.
* Treat GET/PUT/PATCH/DELETE as idempotent; POST only if configured.
* Respect per-request timeout (default 30 s).
* Include idempotency-key header support.
* No external deps beyond `axios` and `axios-retry`.
* TypeScript strict mode; ESM output.

---

## 🟩 Run 3 — Resources (per Tag)

**SYSTEM**
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**
Use `companycam-openapi-spec.yaml`, `src/types.ts`, and `src/manifest.json` as input.
Generate one resource class per API tag:

* `src/resources/<TagName>.ts` (≤ 20 endpoints per file; split if larger).
* `src/client.ts` — `createClient(options)` that instantiates `HttpClient` and resource instances.
* Update `src/index.ts` to export `createClient` and resource types.

Each resource method signature:

```ts
methodName(params: {
  path?: {...};
  query?: {...};
  headers?: {...};
  body?: <requestBodyType>;
  idempotencyKey?: string;
  signal?: AbortSignal;
}): Promise<ResponseEnvelope<<responseType>>>
```

Encode path params; derive types directly from the manifest.
Include concise JSDoc (summary + description + params + return).
If pagination fields exist (`page`, `per_page`, `cursor`, etc.), add an `async *iterateMethodName()` generator based on spec semantics.

---

## 🟩 Run 4 — Docs & JSDoc Polish

**SYSTEM**
You are a senior TypeScript engineer. Output complete files only; no commentary.

**USER**
Use `companycam-openapi-spec.yaml` as context for auth, pagination, and error model.
Tasks:

* Add or refine concise JSDoc on all public methods and classes (summary, key params, returns, errors).
* Generate `README.md` that describes:

  * Purpose (TypeScript SDK for CompanyCam API).
  * Install/build placeholder (no package.json yet).
  * Configuration options (`baseUrl`, `auth`, `timeoutMs`, retry knobs, rate limit behavior).
  * Error handling (`APIError` shape).
  * Pagination overview (based on spec).
  * Note that all SDK content is derived from `companycam-openapi-spec.yaml`.
* Exclude code examples and publishing steps.

---

Each run will now automatically use the spec file already in the repository and the behavioral rules from `agents.md`; you don’t need to provide the file contents manually.
