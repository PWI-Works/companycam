import { describe, expect, it } from "vitest";
import {
  AUTHORIZATION_ENDPOINT,
  TOKEN_ENDPOINT,
  buildAuthorizationGrantUrl,
  buildAuthorizationCodeTokenPayload,
  buildRefreshTokenPayload,
} from "../src/oauth.js";

// The OAuth helper functions should mirror the documented authorization and token flows.
describe("uri helpers", () => {
  describe("buildAuthorizationGrantUrl", () => {
    it("throws when scope is an empty array", () => {
      expect(() =>
        buildAuthorizationGrantUrl(
          "client-123",
          "https://example.com/callback",
          []
        )
      ).toThrow(/scope must not be an empty array/);
    });

    it("includes the documented defaults when no optional overrides are supplied", () => {
      const redirectUri = "https://example.com/oauth/callback?foo=bar";
      const result = buildAuthorizationGrantUrl("client-123", redirectUri, [
        "read",
        "write",
        "destroy",
      ]);
      const parsed = new URL(result);

      expect(parsed.origin + parsed.pathname).toBe(AUTHORIZATION_ENDPOINT);
      expect(parsed.searchParams.get("response_type")).toBe("code");
      expect(parsed.searchParams.get("client_id")).toBe("client-123");
      expect(parsed.searchParams.get("redirect_uri")).toBe(redirectUri);
      expect(parsed.searchParams.get("scope")).toBe("read write destroy");
    });

    it("applies custom scope ordering while trimming incidental whitespace", () => {
      const result = buildAuthorizationGrantUrl(
        "client-456",
        "https://example.com/callback",
        ["write", "read"]
      );
      const parsed = new URL(result);

      expect(parsed.searchParams.get("scope")).toBe("write read");
    });

    it("throws when required parameters are empty", () => {
      expect(() =>
        buildAuthorizationGrantUrl("", "https://example.com/callback", [
          "read",
          "write",
          "destroy",
        ])
      ).toThrow(/clientId/i);
      expect(() =>
        buildAuthorizationGrantUrl("client-123", "", [
          "read",
          "write",
          "destroy",
        ])
      ).toThrow(/redirectUri/i);
    });
  });

  describe("buildAuthorizationCodeTokenPayload", () => {
    it("produces an authorization_code payload targeting the documented token endpoint", () => {
      const payload = buildAuthorizationCodeTokenPayload(
        "client-123",
        "secret-456",
        "auth-code",
        "https://example.com/callback"
      );

      expect(TOKEN_ENDPOINT).toBe("https://app.companycam.com/oauth/token");
      expect(payload.get("client_id")).toBe("client-123");
      expect(payload.get("client_secret")).toBe("secret-456");
      expect(payload.get("code")).toBe("auth-code");
      expect(payload.get("grant_type")).toBe("authorization_code");
      expect(payload.get("redirect_uri")).toBe("https://example.com/callback");
    });

    it("rejects empty required fields to prevent malformed requests", () => {
      expect(() =>
        buildAuthorizationCodeTokenPayload(
          "",
          "secret",
          "auth-code",
          "https://example.com/callback"
        )
      ).toThrow(/clientId/i);

      expect(() =>
        buildAuthorizationCodeTokenPayload(
          "client",
          "",
          "auth-code",
          "https://example.com/callback"
        )
      ).toThrow(/clientSecret/i);
    });
  });

  describe("buildRefreshTokenPayload", () => {
    it("produces a refresh_token payload with the documented grant type", () => {
      const payload = buildRefreshTokenPayload(
        "client-321",
        "secret-654",
        "refresh-999"
      );

      expect(payload.get("client_id")).toBe("client-321");
      expect(payload.get("client_secret")).toBe("secret-654");
      expect(payload.get("refresh_token")).toBe("refresh-999");
      expect(payload.get("grant_type")).toBe("refresh_token");
    });

    it("rejects empty required fields to prevent malformed requests", () => {
      expect(() =>
        buildRefreshTokenPayload("", "secret-654", "refresh-999")
      ).toThrow(/clientId/i);

      expect(() =>
        buildRefreshTokenPayload("client-321", "", "refresh-999")
      ).toThrow(/clientSecret/i);

      expect(() =>
        buildRefreshTokenPayload("client-321", "secret-654", "")
      ).toThrow(/refreshToken/i);
    });
  });
});
