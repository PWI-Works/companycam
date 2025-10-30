import type { Group, PaginationQueryParams, User } from "../interfaces.js";
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
 * Resource for managing user groups. Offers helpers for listing, creating, updating,
 * and deleting company-level groups via the generated HTTP client.
 */
export class GroupsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List groups defined within the company.
   *
   * @param query Optional pagination controls (`page`, `per_page`) from the spec.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Group} records.
   * @throws {APIError} When the API responds with an error status.
   */
  async list(
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Group[]> {
    const response = await this.http.request<Group[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/groups",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Create a new group.
   *
   * @param name Optional name to assign to the group per the spec.
   * @param userIds Optional list of user identifiers to include, matching the spec schema.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The newly created {@link Group}.
   * @throws {APIError} When the API responds with an error status.
  */
  async create(
    name?: Group["name"],
    userIds?: Array<User["id"]>,
    options?: UserScopedRequestOptions
  ): Promise<Group> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const groupPayload =
      name !== undefined || userIds !== undefined
        ? {
            ...(name !== undefined ? { name } : {}),
            ...(userIds !== undefined ? { users: userIds } : {}),
          }
        : {};
    const response = await this.http.request<Group>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: "/groups",
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: { group: groupPayload },
    });

    return response.data;
  }

  /**
   * Retrieve a specific group by identifier.
   *
   * @param groupId Identifier of the group to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link Group}.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(groupId: string, options?: RequestOptions): Promise<Group> {
    const response = await this.http.request<Group>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/groups/${encodePathParam(groupId)}`,
    });

    return response.data;
  }

  /**
   * Update an existing group.
   *
   * @param groupId Identifier of the group to update.
   * @param name Optional name to assign to the group per the spec.
   * @param userIds Optional list of user identifiers to include, matching the spec schema.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link Group}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    groupId: string,
    name?: Group["name"],
    userIds?: Array<User["id"]>,
    options?: RequestOptions
  ): Promise<Group> {
    const groupPayload =
      name !== undefined || userIds !== undefined
        ? {
            ...(name !== undefined ? { name } : {}),
            ...(userIds !== undefined ? { users: userIds } : {}),
          }
        : {};
    const response = await this.http.request<Group>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/groups/${encodePathParam(groupId)}`,
      data: { group: groupPayload },
    });

    return response.data;
  }

  /**
   * Delete a group.
   *
   * @param groupId Identifier of the group to delete.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
   */
  async delete(groupId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/groups/${encodePathParam(groupId)}`,
    });
  }
}
