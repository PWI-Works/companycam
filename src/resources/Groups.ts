import type {
  CreateGroupRequestBody,
  Group,
  PaginationQueryParams,
  UpdateGroupRequestBody,
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
 * Resource for managing user groups.
 */
export class GroupsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List groups defined within the company.
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
   */
  async create(
    body: CreateGroupRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Group> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Group>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: "/groups",
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }

  /**
   * Retrieve a specific group by identifier.
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
   */
  async update(
    groupId: string,
    body: UpdateGroupRequestBody,
    options?: RequestOptions
  ): Promise<Group> {
    const response = await this.http.request<Group>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/groups/${encodePathParam(groupId)}`,
      data: body,
    });

    return response.data;
  }

  /**
   * Delete a group.
   */
  async delete(groupId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/groups/${encodePathParam(groupId)}`,
    });
  }
}
