/** OAuth 2.0 authorization endpoint documented in the public OAuth guide. */
export const AUTHORIZATION_ENDPOINT =
  "https://app.companycam.com/oauth/authorize";

/** OAuth 2.0 token endpoint documented in the public OAuth guide. */
export const TOKEN_ENDPOINT = "https://app.companycam.com/oauth/token";

/** Default scopes requested when none are explicitly provided by the caller. */
export const DEFAULT_OAUTH_SCOPES = ["read", "write", "destroy"] as const;

/** All valid OAuth scopes. */
export type OAuthScope = "read" | "write" | "destroy";

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
 * Build the form payload for exchanging an authorization code for access and refresh tokens.
 *
 * The OAuth documentation specifies the request must be
 * `application/x-www-form-urlencoded`, which aligns with {@link URLSearchParams}.
 *
 * @param clientId Identifier issued by CompanyCam for the external integration.
 * @param clientSecret Secret paired with the client identifier.
 * @param code Authorization code received from the authorization grant.
 * @param redirectUri Redirect URI used during the authorization grant.
 * @returns URL encoded payload ready for POSTing to the token endpoint.
 */
export function buildAuthorizationCodeTokenPayload(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): URLSearchParams {
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
  return params;
}

/**
 * Build the form payload for exchanging a refresh token for a new access token.
 *
 * Each refresh operation yields a brand new refresh token; callers should persist both
 * values on every successful response.
 *
 * @param clientId Identifier issued by CompanyCam for the external integration.
 * @param clientSecret Secret paired with the client identifier.
 * @param refreshToken Refresh token obtained from a prior token exchange.
 * @returns URL encoded payload ready for POSTing to the token endpoint.
 */
export function buildRefreshTokenPayload(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): URLSearchParams {
  assertNonEmpty(clientId, "clientId");
  assertNonEmpty(clientSecret, "clientSecret");
  assertNonEmpty(refreshToken, "refreshToken");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");
  return params;
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
