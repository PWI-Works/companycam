import type {
  CreateTagRequestBody,
  PaginationQueryParams,
  Tag,
  UpdateTagRequestBody,
} from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import {
  buildRequestConfig,
  cleanQueryParameters,
  encodePathParam,
  RequestOptions,
} from "./utils.js";

/**
 * Resource dedicated to managing tags.
 */
export class TagsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List tags configured for the company.
   *
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Tag} records.
   * @throws {APIError} When the API responds with an error status.
   */
  async list(
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Tag[]> {
    const response = await this.http.request<Tag[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/tags",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Create a new tag.
   *
   * @param body Payload describing the tag to create.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The created {@link Tag}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(body: CreateTagRequestBody, options?: RequestOptions): Promise<Tag> {
    const response = await this.http.request<Tag>({
      ...buildRequestConfig(options),
      method: "POST",
      url: "/tags",
      data: body,
    });

    return response.data;
  }

  /**
   * Retrieve a tag by identifier.
   *
   * @param tagId Identifier of the tag to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link Tag}.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(tagId: string, options?: RequestOptions): Promise<Tag> {
    const response = await this.http.request<Tag>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/tags/${encodePathParam(tagId)}`,
    });

    return response.data;
  }

  /**
   * Update an existing tag.
   *
   * @param tagId Identifier of the tag to update.
   * @param body Payload describing the new tag attributes.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link Tag}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    tagId: string,
    body: UpdateTagRequestBody,
    options?: RequestOptions
  ): Promise<Tag> {
    const response = await this.http.request<Tag>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/tags/${encodePathParam(tagId)}`,
      data: body,
    });

    return response.data;
  }

  /**
   * Delete a tag.
   *
   * @param tagId Identifier of the tag to delete.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
   */
  async delete(tagId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/tags/${encodePathParam(tagId)}`,
    });
  }
}
