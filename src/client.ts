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
 * Options accepted by the client factory. Mirrors the underlying HTTP client configuration.
 */
export interface ClientOptions extends HttpClientConfig {}

/**
 * Fully composed CompanyCam API client exposing resource helpers.
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
  /** Dispose of any owned resources such as the shared rate limiter. */
  dispose(): void;
}

/**
 * Instantiate a CompanyCam API client with sensible defaults.
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
