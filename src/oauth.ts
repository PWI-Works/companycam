import { HttpClient } from "./http/HttpClient.js";

/** OAuth 2.0 authorization endpoint documented in the public OAuth guide. */
export const AUTHORIZATION_ENDPOINT =
  "https://app.companycam.com/oauth/authorize";

/** OAuth 2.0 token endpoint documented in the public OAuth guide. */
export const TOKEN_ENDPOINT = "https://app.companycam.com/oauth/token";
const TOKEN_URL = new URL(TOKEN_ENDPOINT);

/** Default scopes requested when none are explicitly provided by the caller. */
export const DEFAULT_OAUTH_SCOPES = ["read", "write", "destroy"] as const;

/** All valid OAuth scopes. */
export type OAuthScope = "read" | "write" | "destroy";

/**
 * Shape of the payload returned by the OAuth token endpoint. These fields follow the
 * standard OAuth 2.0 token response, which the CompanyCam OAuth server mirrors.
 */
export interface OAuthTokenResponse {
  /** Bearer token used to authenticate subsequent CompanyCam API requests. */
  access_token: string;
  /** Token classification as reported by the OAuth server, typically "bearer". */
  token_type: string;
  /** Lifetime of the access token in seconds when supplied by the OAuth server. */
  expires_in?: number;
  /** Refresh token that can be exchanged for a fresh access token. */
  refresh_token?: string;
  /** Granted scopes represented as a space-delimited string, when returned. */
  scope?: string;
}

/**
 * Build the authorization redirect URL that initiates the OAuth 2.0 authorization-code flow.
 *
 * @param clientId Identifier issued by CompanyCam for the external integration.
 * @param redirectUri URI that receives the authorization response.
 * @param scope Optional scope override; defaults to all documented scopes when omitted.
 * @returns Fully prepared authorization URL ready for browser redirection.
 */
export function buildAuthorizationGrantUrl(
  clientId: string,
  redirectUri: string,
  scope: readonly OAuthScope[] | OAuthScope
): string {
  assertNonEmpty(clientId, "clientId");
  assertNonEmpty(redirectUri, "redirectUri");
  // Assert that scope is not an empty array
  if (Array.isArray(scope) && scope.length === 0) {
    throw new Error("scope must not be an empty array");
  }

  const url = new URL(AUTHORIZATION_ENDPOINT);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);

  const normalizedScope = normalizeScope(scope);
  if (normalizedScope) {
    url.searchParams.append("scope", normalizedScope);
  }

  return url.toString();
}

/**
 * Exchange an authorization code for access and refresh tokens by POSTing the documented
 * form-encoded payload directly to the OAuth token endpoint.
 *
 * @param clientId Identifier issued by CompanyCam for the external integration.
 * @param clientSecret Secret paired with the client identifier.
 * @param code Authorization code received from the authorization grant.
 * @param redirectUri Redirect URI used during the authorization grant.
 * @returns Promise that resolves with the OAuth token response body.
 */
export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> {
  assertNonEmpty(clientId, "clientId");
  assertNonEmpty(clientSecret, "clientSecret");
  assertNonEmpty(code, "code");
  assertNonEmpty(redirectUri, "redirectUri");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("code", code);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", redirectUri);
  return executeTokenExchange(params);
}

/**
 * Exchange a refresh token for a brand new access token directly against the OAuth
 * token endpoint. Each response includes a new refresh token when the server issues one.
 *
 * @param clientId Identifier issued by CompanyCam for the external integration.
 * @param clientSecret Secret paired with the client identifier.
 * @param refreshToken Refresh token obtained from a prior token exchange.
 * @returns Promise that resolves with the OAuth token response body.
 */
export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<OAuthTokenResponse> {
  assertNonEmpty(clientId, "clientId");
  assertNonEmpty(clientSecret, "clientSecret");
  assertNonEmpty(refreshToken, "refreshToken");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");
  return executeTokenExchange(params);
}

/**
 * Normalize the scope input into a space-delimited string, matching the examples in the
 * OAuth guide while preserving caller-provided ordering when supplied.
 *
 * @param input Caller-provided scope input as a string or array of strings.
 * @returns Space-delimited scope string or `undefined` when no valid scope remains.
 */
function normalizeScope(
  input?: readonly string[] | string
): string | undefined {
  if (Array.isArray(input)) {
    const entries = input
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    if (entries.length === 0) {
      return undefined;
    }

    return entries.join(" ");
  }

  if (typeof input === "string") {
    const trimmed = input.trim().replace(/\s+/g, " ");
    return trimmed.length > 0 ? trimmed : undefined;
  }

  // Default to all documented scopes when no explicit override is supplied.
  return DEFAULT_OAUTH_SCOPES.join(" ");
}

/**
 * Guard against accidentally passing empty strings to the OAuth endpoints, which would lead
 * to unclear 4xx responses from the API. We validate early to provide actionable feedback.
 *
 * @param value Value to validate for emptiness.
 * @param label Name used in the thrown error when validation fails.
 * @throws Error when the provided value is not a non-empty string.
 */
function assertNonEmpty(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

let tokenHttpClient: HttpClient | null = null;

/**
 * Lazily instantiate the HTTP client pointed at the OAuth token endpoint so we can apply
 * the same retry, timeout, and rate-limiting defaults used throughout the SDK.
 */
function getTokenHttpClient(): HttpClient {
  if (!tokenHttpClient) {
    tokenHttpClient = new HttpClient({
      baseURL: TOKEN_URL.origin,
    });
  }
  return tokenHttpClient;
}

/**
 * Submit the encoded token payload to the OAuth token endpoint and surface the response body.
 *
 * @param payload URL-encoded data prepared by the calling helper.
 * @returns Promise resolving with the parsed OAuth token response.
 */
async function executeTokenExchange(
  payload: URLSearchParams
): Promise<OAuthTokenResponse> {
  const http = getTokenHttpClient();
  const response = await http.request<OAuthTokenResponse>({
    method: "POST",
    url: `${TOKEN_URL.pathname}${TOKEN_URL.search}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: payload,
  });
  return response.data;
}
