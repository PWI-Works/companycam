import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../../src/http/HttpClient.js";
import type { Photo, Tag } from "../../src/interfaces.js";
import { PhotosResource } from "../../src/resources/Photos.js";

// A concise helper mirroring the Axios response signature expected by the HttpClient.
function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {} as any,
    config: { headers: {} as any },
  };
}

describe("PhotosResource", () => {
  let request: ReturnType<typeof vi.fn>;
  let resource: PhotosResource;

  beforeEach(() => {
    // Reset the HttpClient mock before each test to avoid cross-test interference.
    request = vi.fn();
    const http = { request } as unknown as HttpClient;
    resource = new PhotosResource(http);
  });

  it("creates photo tags via the spec-aligned helper", async () => {
    // The helper should issue a POST to the tags endpoint while preserving the payload.
    const tags = ["before", "after"];
    const tag: Tag = { id: "t-1" };
    request.mockResolvedValueOnce(buildResponse(tag));

    const result = await resource.tags.create("photo id", tags, {
      authToken: "override-token",
    });

    expect(result).toEqual(tag);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/photos/photo%20id/tags",
      authToken: "override-token",
      data: { tags },
    });
  });

  it("keeps the legacy add helper as a thin alias", async () => {
    // Existing consumers should keep working while the new helper performs the actual request.
    const photo: Photo = { id: "p-1" };
    const tag: Tag = { id: "t-2" };
    request.mockResolvedValueOnce(buildResponse(tag));

    const result = await resource.tags.create(photo.id, ["demo"]);

    expect(result).toEqual(tag);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/photos/p-1/tags",
      data: { tags: ["demo"] },
    });
  });
});
