import { HttpClient } from "./http/HttpClient.js";
import type { HttpClientConfig } from "./http/HttpClient.js";
import { ChecklistsResource } from "./resources/Checklists.js";
import { CompanyResource } from "./resources/Company.js";
import { GroupsResource } from "./resources/Groups.js";
import { PhotosResource } from "./resources/Photos.js";
import { ProjectsResource } from "./resources/Projects.js";
import { TagsResource } from "./resources/Tags.js";
import { TemplatesResource } from "./resources/Templates.js";
import { UsersResource } from "./resources/Users.js";
import { WebhooksResource } from "./resources/Webhooks.js";

/**
 * Options accepted by {@link createClient}. Use these to point the SDK at the spec-defined
 * base URL, inject the bearer token, or override timeouts, retry behavior, and rate limiting.
 */
export interface ClientOptions extends HttpClientConfig {}

/**
 * Fully composed CompanyCam API client exposing strongly typed resource helpers plus
 * access to the underlying {@link HttpClient}.
 */
export interface CompanyCamClient {
  /** Low-level HTTP client for advanced scenarios. */
  readonly http: HttpClient;
  readonly checklists: ChecklistsResource;
  readonly company: CompanyResource;
  readonly users: UsersResource;
  readonly projects: ProjectsResource;
  readonly photos: PhotosResource;
  readonly tags: TagsResource;
  readonly templates: TemplatesResource;
  readonly groups: GroupsResource;
  readonly webhooks: WebhooksResource;
  /**
   * Dispose of any owned resources such as the shared rate limiter when the client
   * is no longer needed.
   */
  dispose(): void;
}

/**
 * Instantiate a CompanyCam API client backed by the generated HTTP layer and resource helpers.
 *
 * @param options Optional overrides for the HTTP client such as base URL, auth token, retry behavior,
 * and rate limiter configuration.
 * @returns A structured client with helpers for each CompanyCam resource.
 */
export function createClient(options: ClientOptions = {}): CompanyCamClient {
  const http = new HttpClient(options);

  return {
    http,
    checklists: new ChecklistsResource(http),
    company: new CompanyResource(http),
    users: new UsersResource(http),
    projects: new ProjectsResource(http),
    photos: new PhotosResource(http),
    tags: new TagsResource(http),
    templates: new TemplatesResource(http),
    groups: new GroupsResource(http),
    webhooks: new WebhooksResource(http),
    dispose: () => http.dispose(),
  };
}
