import type { ChecklistTemplate } from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import { buildRequestConfig, RequestOptions } from "./utils.js";

/**
 * Resource for interacting with template catalogs.
 */
export class TemplatesResource {
  readonly checklists: ChecklistTemplatesResource;

  constructor(private readonly http: HttpClient) {
    this.checklists = new ChecklistTemplatesResource(http);
  }
}

/**
 * Manage checklist templates available to the company.
 */
export class ChecklistTemplatesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List available checklist templates.
   */
  async list(options?: RequestOptions): Promise<ChecklistTemplate[]> {
    const response = await this.http.request<ChecklistTemplate[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/templates/checklists",
    });

    return response.data;
  }
}
