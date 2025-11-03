
/** OAuth 2.0 authorization endpoint documented in the public OAuth guide. */
export const AUTHORIZATION_ENDPOINT = "https://app.companycam.com/oauth/authorize";

/** OAuth 2.0 token endpoint documented in the public OAuth guide. */
export const TOKEN_ENDPOINT = "https://app.companycam.com/oauth/token";

/** Default scopes requested when none are explicitly provided by the caller. */
export const DEFAULT_OAUTH_SCOPES = ["read", "write", "destroy"] as const;

type OAuthScope = "read" | "write" | "destroy";

/** Options available when generating the authorization redirect URI. */
export interface AuthorizationGrantOptions {
  /**
   * Scopes to request. The public OAuth documentation lists `read`, `write`, and `destroy`
   * as the valid scope values. When omitted, we request all documented scopes.
   */
  readonly scope?: readonly OAuthScope[] | OAuthScope;
  /**
   * Opaque state that should be echoed back by the authorization server.
   * Provides CSRF mitigation for the host application.
   */
  readonly state?: string;
}

/** Required parameters for the authorization-code token exchange request. */
export interface AuthorizationCodeTokenOptions {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly code: string;
  readonly redirectUri: string;
}

/** Required parameters for the refresh-token exchange request. */
export interface RefreshTokenOptions {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
}

/**
 * Build the authorization redirect URL that initiates the OAuth 2.0 authorization-code flow.
 *
 * @param clientId   Identifier issued by CompanyCam for the external integration.
 * @param redirectUri URI that receives the authorization response.
 * @param options    Optional scope/state overrides.
 * @returns Fully prepared authorization URL ready for browser redirection.
 */
export function buildAuthorizationGrantUrl(
  clientId: string,
  redirectUri: string,
  options: AuthorizationGrantOptions = {},
): string {
  assertNonEmpty(clientId, "clientId");
  assertNonEmpty(redirectUri, "redirectUri");

  const url = new URL(AUTHORIZATION_ENDPOINT);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);

  const scope = normalizeScope(options.scope);
  if (scope) {
    url.searchParams.append("scope", scope);
  }

  if (typeof options.state === "string" && options.state.trim().length > 0) {
    url.searchParams.append("state", options.state);
  }

  return url.toString();
}

/**
 * Build the form payload for exchanging an authorization code for access and refresh tokens.
 *
 * The OAuth documentation specifies the request must be
 * `application/x-www-form-urlencoded`, which aligns with {@link URLSearchParams}.
 */
export function buildAuthorizationCodeTokenPayload(
  options: AuthorizationCodeTokenOptions,
): URLSearchParams {
  assertNonEmpty(options.clientId, "options.clientId");
  assertNonEmpty(options.clientSecret, "options.clientSecret");
  assertNonEmpty(options.code, "options.code");
  assertNonEmpty(options.redirectUri, "options.redirectUri");

  const params = new URLSearchParams();
  params.append("client_id", options.clientId);
  params.append("client_secret", options.clientSecret);
  params.append("code", options.code);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", options.redirectUri);
  return params;
}

/**
 * Build the form payload for exchanging a refresh token for a new access token.
 *
 * Each refresh operation yields a brand new refresh token; callers should persist both
 * values on every successful response.
 */
export function buildRefreshTokenPayload(options: RefreshTokenOptions): URLSearchParams {
  assertNonEmpty(options.clientId, "options.clientId");
  assertNonEmpty(options.clientSecret, "options.clientSecret");
  assertNonEmpty(options.refreshToken, "options.refreshToken");

  const params = new URLSearchParams();
  params.append("client_id", options.clientId);
  params.append("client_secret", options.clientSecret);
  params.append("refresh_token", options.refreshToken);
  params.append("grant_type", "refresh_token");
  return params;
}

/**
 * Normalize the scope input into a space-delimited string, matching the examples in the
 * OAuth guide while preserving caller-provided ordering when supplied.
 */
function normalizeScope(input?: readonly string[] | string): string | undefined {
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
 */
function assertNonEmpty(value: string, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}
