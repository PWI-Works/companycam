import type {
  CreateUserRequestBody,
  PaginationQueryParams,
  UpdateUserRequestBody,
  User,
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
   */
  async create(
    body: CreateUserRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<User> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<User>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: "/users",
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }

  /**
   * Retrieve a specific user by identifier.
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
   */
  async update(
    userId: string,
    body: UpdateUserRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<User> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<User>({
      ...buildRequestConfig(requestOptions),
      method: "PUT",
      url: `/users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }

  /**
   * Delete a user from the company.
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
