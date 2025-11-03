import { describe, expect, it, vi } from "vitest";
import { BASE_CLIENT_URL, createClient } from "../src/client.js";
import { HttpClient } from "../src/http/HttpClient.js";
import { ChecklistsResource } from "../src/resources/Checklists.js";
import { CompanyResource } from "../src/resources/Company.js";
import { GroupsResource } from "../src/resources/Groups.js";
import { PhotosResource } from "../src/resources/Photos.js";
import { ProjectsResource } from "../src/resources/Projects.js";
import { TagsResource } from "../src/resources/Tags.js";
import { TemplatesResource } from "../src/resources/Templates.js";
import { UsersResource } from "../src/resources/Users.js";
import { WebhooksResource } from "../src/resources/Webhooks.js";

// The client factory should expose a fully composed SDK without making outbound requests.
describe("createClient", () => {
  it("instantiates resources that share the same HttpClient instance", () => {
    const client = createClient({ timeoutMs: 1_000 });

    // The root HttpClient instance should be reused across every resource helper.
    expect(client.http).toBeInstanceOf(HttpClient);
    expect(client.checklists).toBeInstanceOf(ChecklistsResource);
    expect(client.company).toBeInstanceOf(CompanyResource);
    expect(client.users).toBeInstanceOf(UsersResource);
    expect(client.projects).toBeInstanceOf(ProjectsResource);
    expect(client.photos).toBeInstanceOf(PhotosResource);
    expect(client.tags).toBeInstanceOf(TagsResource);
    expect(client.templates).toBeInstanceOf(TemplatesResource);
    expect(client.groups).toBeInstanceOf(GroupsResource);
    expect(client.webhooks).toBeInstanceOf(WebhooksResource);

    // Disposing the composed client should dispose the shared HttpClient exactly once.
    const disposeSpy = vi.spyOn(client.http, "dispose");
    client.dispose();
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it("defaults the HttpClient base URL to the spec-defined endpoint", () => {
    const client = createClient();

    // Accessing the axios instance allows us to inspect the derived base URL.
    const axiosInstance = (client.http as unknown as { axiosInstance: { defaults: { baseURL?: string } } }).axiosInstance;
    expect(axiosInstance.defaults.baseURL).toBe(BASE_CLIENT_URL);
  });

  it("allows overriding the base URL when provided", () => {
    const customBaseURL = "https://example.com/custom";
    const client = createClient({ baseURL: customBaseURL });

    const axiosInstance = (client.http as unknown as { axiosInstance: { defaults: { baseURL?: string } } }).axiosInstance;
    expect(axiosInstance.defaults.baseURL).toBe(customBaseURL);
  });
});
