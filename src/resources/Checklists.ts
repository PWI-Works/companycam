import type { Checklist, ListChecklistsQueryParams } from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import { buildRequestConfig, cleanQueryParameters, RequestOptions } from "./utils.js";

/**
 * Resource providing access to checklist level operations that are not scoped to a project.
 * All requests are routed through the shared {@link HttpClient}.
 */
export class ChecklistsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the company-wide list of checklists sorted by their last update timestamp.
   *
   * @param query Optional pagination filters declared in the spec (page, per_page, completed).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Checklist} records returned by the API.
   * @throws {APIError} When the API responds with an error status.
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
