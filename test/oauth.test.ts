import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpClient } from "../src/http/HttpClient.js";
import type { AxiosResponse } from "axios";
import {
  AUTHORIZATION_ENDPOINT,
  TOKEN_ENDPOINT,
  buildAuthorizationGrantUrl,
  getAccessToken,
  refreshAccessToken,
  type OAuthTokenResponse,
} from "../src/oauth.js";

afterEach(() => {
  vi.restoreAllMocks();
});

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
});

describe("token exchange helpers", () => {
  describe("getAccessToken", () => {
    it("POSTs the authorization_code payload to the documented token endpoint", async () => {
      const expected: OAuthTokenResponse = {
        access_token: "access-123",
        refresh_token: "refresh-456",
        token_type: "bearer",
        expires_in: 3600,
        scope: "read write",
      };
      const requestSpy = vi
        .spyOn(HttpClient.prototype, "request")
        .mockResolvedValue(createAxiosResponse(expected));

      const result = await getAccessToken(
        "client-123",
        "secret-456",
        "auth-code",
        "https://example.com/callback"
      );

      expect(TOKEN_ENDPOINT).toBe("https://app.companycam.com/oauth/token");
      expect(result).toEqual(expected);
      expect(requestSpy).toHaveBeenCalledTimes(1);

      const requestConfig = requestSpy.mock.calls[0][0];
      expect(requestConfig.method).toBe("POST");
      expect(requestConfig.url).toBe("/oauth/token");
      expect(requestConfig.headers).toMatchObject({
        "Content-Type": "application/x-www-form-urlencoded",
      });

      const body = requestConfig.data as URLSearchParams;
      expect(body.get("client_id")).toBe("client-123");
      expect(body.get("client_secret")).toBe("secret-456");
      expect(body.get("code")).toBe("auth-code");
      expect(body.get("grant_type")).toBe("authorization_code");
      expect(body.get("redirect_uri")).toBe("https://example.com/callback");
    });

    it("rejects empty required fields to prevent malformed requests", async () => {
      await expect(
        getAccessToken(
          "",
          "secret",
          "auth-code",
          "https://example.com/callback"
        )
      ).rejects.toThrow(/clientId/i);

      await expect(
        getAccessToken(
          "client",
          "",
          "auth-code",
          "https://example.com/callback"
        )
      ).rejects.toThrow(/clientSecret/i);

      await expect(
        getAccessToken("client", "secret", "", "https://example.com/callback")
      ).rejects.toThrow(/code/i);

      await expect(
        getAccessToken("client", "secret", "auth-code", "")
      ).rejects.toThrow(/redirectUri/i);
    });
  });

  describe("refreshAccessToken", () => {
    it("POSTs the refresh_token payload to the documented token endpoint", async () => {
      const expected: OAuthTokenResponse = {
        access_token: "new-access",
        refresh_token: "new-refresh",
        token_type: "bearer",
        expires_in: 7200,
      };
      const requestSpy = vi
        .spyOn(HttpClient.prototype, "request")
        .mockResolvedValue(createAxiosResponse(expected));

      const result = await refreshAccessToken(
        "client-321",
        "secret-654",
        "refresh-999"
      );

      expect(result).toEqual(expected);
      expect(requestSpy).toHaveBeenCalledTimes(1);

      const requestConfig = requestSpy.mock.calls[0][0];
      expect(requestConfig.method).toBe("POST");
      expect(requestConfig.url).toBe("/oauth/token");
      expect(requestConfig.headers).toMatchObject({
        "Content-Type": "application/x-www-form-urlencoded",
      });

      const body = requestConfig.data as URLSearchParams;
      expect(body.get("client_id")).toBe("client-321");
      expect(body.get("client_secret")).toBe("secret-654");
      expect(body.get("refresh_token")).toBe("refresh-999");
      expect(body.get("grant_type")).toBe("refresh_token");
    });

    it("rejects empty required fields to prevent malformed requests", async () => {
      await expect(
        refreshAccessToken("", "secret-654", "refresh-999")
      ).rejects.toThrow(/clientId/i);

      await expect(
        refreshAccessToken("client-321", "", "refresh-999")
      ).rejects.toThrow(/clientSecret/i);

      await expect(
        refreshAccessToken("client-321", "secret-654", "")
      ).rejects.toThrow(/refreshToken/i);
    });
  });
});

function createAxiosResponse(
  data: OAuthTokenResponse
): AxiosResponse<OAuthTokenResponse> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  } as AxiosResponse<OAuthTokenResponse>;
}
