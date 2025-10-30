import type { Company } from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import { buildRequestConfig, RequestOptions } from "./utils.js";

/**
 * Resource encapsulating interactions with the company endpoint. Provides helper methods
 * for retrieving the organisation associated with the authenticated token.
 */
export class CompanyResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the company tied to the authenticated API token.
   *
   * @param options Optional request overrides such as a custom abort signal.
   * @returns The authenticated {@link Company} record.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(options?: RequestOptions): Promise<Company> {
    const response = await this.http.request<Company>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/company",
    });

    return response.data;
  }
}
