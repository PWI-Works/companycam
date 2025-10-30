import type { Checklist, ListChecklistsQueryParams } from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import { buildRequestConfig, cleanQueryParameters, RequestOptions } from "./utils.js";

/**
 * Resource providing access to checklist level operations that are not scoped to a project.
 */
export class ChecklistsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the company-wide list of checklists sorted by their last update timestamp.
   */
  async list(
    query?: ListChecklistsQueryParams,
    options?: RequestOptions
  ): Promise<Checklist[]> {
    const response = await this.http.request<Checklist[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/checklists",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }
}
