import { describe, expect, it } from "vitest";
import {
  AUTHORIZATION_ENDPOINT,
  TOKEN_ENDPOINT,
  buildAuthorizationGrantUrl,
  buildAuthorizationCodeTokenPayload,
  buildRefreshTokenPayload,
} from "../src/uri.js";

// The OAuth helper functions should mirror the documented authorization and token flows.
describe("uri helpers", () => {
  describe("buildAuthorizationGrantUrl", () => {
    it("includes the documented defaults when no optional overrides are supplied", () => {
      const redirectUri = "https://example.com/oauth/callback?foo=bar";
      const result = buildAuthorizationGrantUrl("client-123", redirectUri);
      const parsed = new URL(result);

      expect(parsed.origin + parsed.pathname).toBe(AUTHORIZATION_ENDPOINT);
      expect(parsed.searchParams.get("response_type")).toBe("code");
      expect(parsed.searchParams.get("client_id")).toBe("client-123");
      expect(parsed.searchParams.get("redirect_uri")).toBe(redirectUri);
      expect(parsed.searchParams.get("scope")).toBe("read write destroy");
      expect(parsed.searchParams.has("state")).toBe(false);
    });

    it("applies custom scope ordering and state while trimming incidental whitespace", () => {
      const result = buildAuthorizationGrantUrl("client-456", "https://example.com/callback", {
        scope: ["write", "read"],
        state: "csrf-token",
      });
      const parsed = new URL(result);

      expect(parsed.searchParams.get("scope")).toBe("write read");
      expect(parsed.searchParams.get("state")).toBe("csrf-token");
    });

    it("omits scope and state when the provided values are blank", () => {
      const result = buildAuthorizationGrantUrl("client-789", "https://example.com/callback", {
        scope: "",
        state: "   ",
      });
      const parsed = new URL(result);

      expect(parsed.searchParams.has("scope")).toBe(false);
      expect(parsed.searchParams.has("state")).toBe(false);
    });

    it("throws when required parameters are empty", () => {
      expect(() => buildAuthorizationGrantUrl("", "https://example.com/callback")).toThrow(
        /clientId/i,
      );
      expect(() => buildAuthorizationGrantUrl("client-123", "")).toThrow(/redirectUri/i);
    });
  });

  describe("buildAuthorizationCodeTokenPayload", () => {
    it("produces an authorization_code payload targeting the documented token endpoint", () => {
      const payload = buildAuthorizationCodeTokenPayload({
        clientId: "client-123",
        clientSecret: "secret-456",
        code: "auth-code",
        redirectUri: "https://example.com/callback",
      });

      expect(TOKEN_ENDPOINT).toBe("https://app.companycam.com/oauth/token");
      expect(payload.get("client_id")).toBe("client-123");
      expect(payload.get("client_secret")).toBe("secret-456");
      expect(payload.get("code")).toBe("auth-code");
      expect(payload.get("grant_type")).toBe("authorization_code");
      expect(payload.get("redirect_uri")).toBe("https://example.com/callback");
    });

    it("rejects empty required fields to prevent malformed requests", () => {
      expect(() =>
        buildAuthorizationCodeTokenPayload({
          clientId: "",
          clientSecret: "secret",
          code: "auth-code",
          redirectUri: "https://example.com/callback",
        }),
      ).toThrow(/clientId/i);

      expect(() =>
        buildAuthorizationCodeTokenPayload({
          clientId: "client",
          clientSecret: "",
          code: "auth-code",
          redirectUri: "https://example.com/callback",
        }),
      ).toThrow(/clientSecret/i);
    });
  });

  describe("buildRefreshTokenPayload", () => {
    it("produces a refresh_token payload with the documented grant type", () => {
      const payload = buildRefreshTokenPayload({
        clientId: "client-321",
        clientSecret: "secret-654",
        refreshToken: "refresh-999",
      });

      expect(payload.get("client_id")).toBe("client-321");
      expect(payload.get("client_secret")).toBe("secret-654");
      expect(payload.get("refresh_token")).toBe("refresh-999");
      expect(payload.get("grant_type")).toBe("refresh_token");
    });

    it("rejects empty required fields to prevent malformed requests", () => {
      expect(() =>
        buildRefreshTokenPayload({
          clientId: "",
          clientSecret: "secret-654",
          refreshToken: "refresh-999",
        }),
      ).toThrow(/clientId/i);

      expect(() =>
        buildRefreshTokenPayload({
          clientId: "client-321",
          clientSecret: "",
          refreshToken: "refresh-999",
        }),
      ).toThrow(/clientSecret/i);

      expect(() =>
        buildRefreshTokenPayload({
          clientId: "client-321",
          clientSecret: "secret-654",
          refreshToken: "",
        }),
      ).toThrow(/refreshToken/i);
    });
  });
});
