import type {
  CreateWebhookRequestBody,
  PaginationQueryParams,
  UpdateWebhookRequestBody,
  Webhook,
} from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import {
  buildRequestConfig,
  cleanQueryParameters,
  encodePathParam,
  RequestOptions,
} from "./utils.js";

/**
 * Resource for managing webhook registrations.
 */
export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List registered webhooks.
   */
  async list(
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Webhook[]> {
    const response = await this.http.request<Webhook[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/webhooks",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Create a webhook subscription.
   */
  async create(
    body: CreateWebhookRequestBody,
    options?: RequestOptions
  ): Promise<Webhook> {
    const response = await this.http.request<Webhook>({
      ...buildRequestConfig(options),
      method: "POST",
      url: "/webhooks",
      data: body,
    });

    return response.data;
  }

  /**
   * Retrieve a webhook by identifier.
   */
  async retrieve(webhookId: string, options?: RequestOptions): Promise<Webhook> {
    const response = await this.http.request<Webhook>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/webhooks/${encodePathParam(webhookId)}`,
    });

    return response.data;
  }

  /**
   * Update a webhook registration.
   */
  async update(
    webhookId: string,
    body: UpdateWebhookRequestBody,
    options?: RequestOptions
  ): Promise<Webhook> {
    const response = await this.http.request<Webhook>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/webhooks/${encodePathParam(webhookId)}`,
      data: body,
    });

    return response.data;
  }

  /**
   * Delete a webhook registration.
   */
  async delete(webhookId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/webhooks/${encodePathParam(webhookId)}`,
    });
  }
}
