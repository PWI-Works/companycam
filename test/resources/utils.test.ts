import { describe, expect, it } from "vitest";
import {
  buildRequestConfig,
  cleanQueryParameters,
  encodePathParam,
  splitUserScopedOptions,
} from "../../src/resources/utils.js";

describe("resource utilities", () => {
  it("builds request config without leaking unsupported options", () => {
    // Undefined values should be dropped while supported options flow through untouched.
    const controller = new AbortController();
    const config = buildRequestConfig({
      signal: controller.signal,
      authToken: "scoped",
      idempotencyKey: "abc-123",
      useRateLimiter: false,
    });

    expect(config).toMatchObject({
      authToken: "scoped",
      idempotencyKey: "abc-123",
      useRateLimiter: false,
    });
    expect(config.signal).toBe(controller.signal);
  });

  it("returns undefined when every query parameter is filtered out", () => {
    // Removing nullish entries should yield undefined to avoid sending empty objects.
    expect(
      cleanQueryParameters({ page: undefined, per_page: null })
    ).toBeUndefined();
  });

  it("keeps the remaining query parameters intact", () => {
    // Non-nullish values should survive the cleaning pass without modification.
    expect(
      cleanQueryParameters({
        page: 1,
        per_page: undefined,
        query: "roof",
      })
    ).toEqual({ page: 1, query: "roof" });
  });

  it("URL encodes arbitrary path parameters", () => {
    // Encoding ensures each reserved character is preserved exactly as required by the API.
    expect(encodePathParam("user/email@example.com")).toBe(
      "user%2Femail%40example.com"
    );
  });

  it("splits user scoped options into headers and request config", () => {
    // The helper should expose the header while retaining other request-level settings.
    const { requestOptions, userContext } = splitUserScopedOptions({
      "X-CompanyCam-User": "field.tech@example.com",
      authToken: "override",
      idempotencyKey: "123",
    });

    expect(userContext).toBe("field.tech@example.com");
    expect(requestOptions).toEqual({
      authToken: "override",
      idempotencyKey: "123",
    });
  });
});
