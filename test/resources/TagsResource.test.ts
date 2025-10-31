import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../../src/http/HttpClient.js";
import type { Tag, TagMutable } from "../../src/interfaces.js";
import { TagsResource } from "../../src/resources/Tags.js";

// Helper aligning with the Axios response expected by the HttpClient.
function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {} as any,
    config: { headers: {} as any },
  };
}

describe("TagsResource", () => {
  let request: ReturnType<typeof vi.fn>;
  let resource: TagsResource;

  beforeEach(() => {
    request = vi.fn();
    const http = { request } as unknown as HttpClient;
    resource = new TagsResource(http);
  });

  it("creates tags by wrapping the mutable payload", async () => {
    const payload: TagMutable = { display_value: "Before" };
    const tag: Tag = { id: "tag-1" };
    request.mockResolvedValueOnce(buildResponse(tag));

    const result = await resource.create(payload, { authToken: "token" });

    expect(result).toEqual(tag);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/tags",
      authToken: "token",
      data: { tag: payload },
    });
  });

  it("updates tags with the same mutable payload shape", async () => {
    const payload: TagMutable = { display_value: "After" };
    const tag: Tag = { id: "tag-2" };
    request.mockResolvedValueOnce(buildResponse(tag));

    const result = await resource.update("tag-2", payload);

    expect(result).toEqual(tag);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "PUT",
      url: "/tags/tag-2",
      data: { tag: payload },
    });
  });
});

