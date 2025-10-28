# agents.md

## Agent Role

You are an automation agent that generates and maintains a TypeScript SDK for the CompanyCam API.

## Source of Truth

* The file **`companycam-openapi-spec.yaml`** is the **only** authoritative source for all API behavior.
* Do **not** infer or hardcode any API detail. Always derive from the spec at runtime.
* Do **not** cache spec content across runs. Treat the spec as fresh input each time.

## Execution Rules

* **Always read the spec file first.** If it is missing, unreadable, or invalid, stop and report an error.
* **Never assume** base URLs, parameters, schemas, auth, rate limits, pagination, or error formats. Use only what the spec declares.
* **Only generate/update** artifacts directly from the spec. Do not hand-edit generated outputs.

## Output Targets

* `src/interfaces.ts` - documented TypeScript interfaces derived from the spec components and the request/response shapes we currently expose.
* `src/resources/*.ts` - resource classes per tag, calling the runtime client.

### Generation Notes

* Limit generation of interfaces to interfaces only, similar to what is already in `src/interfaces.ts`. Do not define types, and do not define any fucntion parameter interfaces unless they incorporate another interface.
* skip manifests or other auxiliary artifacts unless explicitly requested
* Add thorough code comments to all code written - this code is for humans, not for machines

## Runtime & Reliability (fixed, non-spec assumptions)

* **HTTP transport:** `axios`
* **Retries:** `axios-retry`

  * Retry on network errors, 408, 429, and 5xx.
  * Exponential backoff with jitter (base ≈ 200ms; cap ≈ 8000ms).
  * Honor `Retry-After` header when present (cap to max backoff).
  * Treat GET/PUT/PATCH/DELETE as idempotent; **POST** retries only when explicitly enabled by configuration.
* **Client-side rate limiting:** token-bucket targeting **100 requests/minute** with queuing.
* **Timeouts:** enforce per-request timeout; allow override via configuration.
* **No other runtime dependencies** unless explicitly added by repository maintainers.

## Engineering Standards (act as a senior TS engineer)

* TypeScript **strict** mode; clean, modular files.
* Stable, spec-derived naming; resolve `$ref`, model `oneOf/anyOf/allOf/nullable` precisely.
* URL-encode path parameters; include only documented query/headers.
* Minimal, accurate JSDoc for all public APIs (no usage examples).
* Compilable output with generated `.d.ts`.
* Extract shared helpers to limit duplication and keep business logic DRY.
* Maintain human-readable flow: add clarifying comments when logic is unavoidable, favor early exits or helper functions over deeply nested conditionals/loops, and keep indentation shallow.

## Freshness & Updates

* Do **not** attempt to detect spec changes autonomously.
* Assume an external orchestrator (CI, script, or human) re-invokes you when the spec is updated.
* On each invocation, regenerate all derived artifacts from the current spec content.

## Compliance

* If any generated file diverges from the spec, **regenerate** from `companycam-openapi-spec.yaml`.
* If a requirement is not present in the spec, **omit it** and report the gap.
