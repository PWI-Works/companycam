import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../../src/http/HttpClient.js";
import type {
  CreateProjectRequestBody,
  ListProjectsQueryParams,
  Project,
  User,
} from "../../src/interfaces.js";
import { ProjectsResource } from "../../src/resources/Projects.js";

// A strongly typed Vitest mock representing the HttpClient#request method.
type RequestMock = ReturnType<typeof vi.fn>;

// Local helper for constructing Axios-like responses with minimal boilerplate.
function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {} as any,
    config: { headers: {} as any },
  };
}

describe("ProjectsResource", () => {
  let request: RequestMock;
  let resource: ProjectsResource;

  beforeEach(() => {
    // Reset the mock HttpClient before each test to ensure isolation.
    request = vi.fn();
    const http = { request } as unknown as HttpClient;
    resource = new ProjectsResource(http);
  });

  it("lists projects with cleaned query parameters", async () => {
    // The service should omit undefined values before delegating to the HttpClient.
    const query: ListProjectsQueryParams = {
      page: 1,
      per_page: undefined,
      query: "kitchen",
    };
    const project: Project = { id: "123" };
    request.mockResolvedValueOnce(buildResponse([project]));

    const result = await resource.list(query, { authToken: "override" });

    expect(result).toEqual([project]);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "GET",
      url: "/projects",
      authToken: "override",
      params: { page: 1, query: "kitchen" },
    });
    expect(call.params).not.toHaveProperty("per_page");
  });

  it("creates a project with user impersonation headers", async () => {
    // The resource should forward the impersonation header and request payload untouched.
    const body: CreateProjectRequestBody = { name: "Garage Remodel" };
    const project: Project = { id: "456" };
    request.mockResolvedValueOnce(buildResponse(project));

    const result = await resource.create(body, {
      authToken: "scoped-token",
      "X-CompanyCam-User": "crew.lead@example.com",
    });

    expect(result).toEqual(project);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/projects",
      authToken: "scoped-token",
      headers: { "X-CompanyCam-User": "crew.lead@example.com" },
      data: body,
    });
  });

  it("encodes project identifiers when retrieving a single project", async () => {
    // Identifiers containing reserved characters must be URL encoded exactly once.
    const project: Project = { id: "789" };
    request.mockResolvedValueOnce(buildResponse(project));

    const result = await resource.retrieve("job/alpha 01");

    expect(result).toEqual(project);
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/projects/job%2Falpha%2001",
      })
    );
  });

  it("encodes nested identifiers for assignee management", async () => {
    // Sub-resources must reuse the shared HttpClient while encoding every path segment.
    const user: User = { id: "42" };
    request.mockResolvedValueOnce(buildResponse(user));

    const result = await resource.assignees.assign(
      "job 100",
      "user/email@example.com",
      { "X-CompanyCam-User": "coordinator@example.com" }
    );

    expect(result).toEqual(user);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "PUT",
      url: "/projects/job%20100/assigned_users/user%2Femail%40example.com",
      headers: { "X-CompanyCam-User": "coordinator@example.com" },
    });
  });

  it("omits the user header when not provided for delete operations", async () => {
    // The remove call should not send an impersonation header when none is supplied.
    request.mockResolvedValueOnce(buildResponse(undefined));

    await resource.assignees.remove("job 200", "worker/id");

    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "DELETE",
      url: "/projects/job%20200/assigned_users/worker%2Fid",
    });
    expect(call.headers).toBeUndefined();
  });
});
