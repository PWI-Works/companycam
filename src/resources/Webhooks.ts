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
   *
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Webhook} registrations.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param body Payload describing the webhook to create.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The created {@link Webhook}.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param webhookId Identifier of the webhook to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link Webhook}.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param webhookId Identifier of the webhook to update.
   * @param body Payload describing the updated webhook configuration.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link Webhook}.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param webhookId Identifier of the webhook to delete.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
   */
  async delete(webhookId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/webhooks/${encodePathParam(webhookId)}`,
    });
  }
}
