import type { Company } from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import { buildRequestConfig, RequestOptions } from "./utils.js";

/**
 * Resource encapsulating interactions with the company endpoint.
 */
export class CompanyResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Retrieve the company tied to the authenticated API token.
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
