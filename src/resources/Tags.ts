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
   */
  async delete(tagId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/tags/${encodePathParam(tagId)}`,
    });
  }
}
