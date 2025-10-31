import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../../src/http/HttpClient.js";
import type { Group, GroupMutable } from "../../src/interfaces.js";
import { GroupsResource } from "../../src/resources/Groups.js";

// Helper aligning with the Axios response contract used by the HttpClient.
function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {} as any,
    config: { headers: {} as any },
  };
}

describe("GroupsResource", () => {
  let request: ReturnType<typeof vi.fn>;
  let resource: GroupsResource;

  beforeEach(() => {
    request = vi.fn();
    const http = { request } as unknown as HttpClient;
    resource = new GroupsResource(http);
  });

  it("wraps mutable payloads when creating a group", async () => {
    // Creation should preserve the payload within the top-level group envelope.
    const payload: GroupMutable = { name: "Roofing Crew", users: ["user-1"] };
    const group: Group = { id: "group-1" };
    request.mockResolvedValueOnce(buildResponse(group));

    const result = await resource.create(payload, {
      "X-CompanyCam-User": "owner@example.com",
    });

    expect(result).toEqual(group);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/groups",
      headers: { "X-CompanyCam-User": "owner@example.com" },
      data: { group: payload },
    });
  });

  it("reuses the mutable payload for group updates", async () => {
    // Update should send the same envelope while omitting undefined attributes.
    const payload: GroupMutable = { users: ["user-1", "user-2"] };
    const group: Group = { id: "group-2" };
    request.mockResolvedValueOnce(buildResponse(group));

    const result = await resource.update("group-2", payload);

    expect(result).toEqual(group);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "PUT",
      url: "/groups/group-2",
      data: { group: payload },
    });
  });
});

