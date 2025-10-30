import type {
  PaginationQueryParams,
  User,
  UserCreateInput,
  UserUpdateInput,
} from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import {
  buildRequestConfig,
  cleanQueryParameters,
  encodePathParam,
  RequestOptions,
  splitUserScopedOptions,
  UserScopedRequestOptions,
} from "./utils.js";

/**
 * Resource covering all user lifecycle operations.
 */
export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the authenticated user associated with the API token.
   *
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The {@link User} that owns the provided token.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieveCurrent(options?: RequestOptions): Promise<User> {
    const response = await this.http.request<User>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/users/current",
    });

    return response.data;
  }

  /**
   * List all users for the current company.
   *
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link User} records.
   * @throws {APIError} When the API responds with an error status.
   */
  async list(
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<User[]> {
    const response = await this.http.request<User[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/users",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Create a new user within the company.
   *
   * @param user Attributes describing the user to create.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link User}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    user: UserCreateInput,
    options?: UserScopedRequestOptions
  ): Promise<User> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<User>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: "/users",
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: { user },
    });

    return response.data;
  }

  /**
   * Retrieve a specific user by identifier.
   *
   * @param userId Identifier of the user to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link User}.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(userId: string, options?: RequestOptions): Promise<User> {
    const response = await this.http.request<User>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/users/${encodePathParam(userId)}`,
    });

    return response.data;
  }

  /**
   * Update an existing user record.
   *
   * @param userId Identifier of the user to update.
   * @param updates Attributes describing the changes to apply.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The updated {@link User}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    userId: string,
    updates: UserUpdateInput,
    options?: UserScopedRequestOptions
  ): Promise<User> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<User>({
      ...buildRequestConfig(requestOptions),
      method: "PUT",
      url: `/users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: updates,
    });

    return response.data;
  }

  /**
   * Delete a user from the company.
   *
   * @param userId Identifier of the user to delete.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
   */
  async delete(
    userId: string,
    options?: UserScopedRequestOptions
  ): Promise<void> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    await this.http.request<void>({
      ...buildRequestConfig(requestOptions),
      method: "DELETE",
      url: `/users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });
  }
}
