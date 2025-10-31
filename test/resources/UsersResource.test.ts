import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../../src/http/HttpClient.js";
import type { User, UserCreatePayload, UserMutable } from "../../src/interfaces.js";
import { UsersResource } from "../../src/resources/Users.js";

// Local helper mirroring the Axios response contract expected by the HttpClient.
function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {} as any,
    config: { headers: {} as any },
  };
}

describe("UsersResource", () => {
  let request: ReturnType<typeof vi.fn>;
  let resource: UsersResource;

  beforeEach(() => {
    request = vi.fn();
    const http = { request } as unknown as HttpClient;
    resource = new UsersResource(http);
  });

  it("wraps creation payloads inside the expected user envelope", async () => {
    // The API expects a { user: {...} } envelope; ensure we preserve the payload verbatim.
    const payload: UserCreatePayload = {
      first_name: "Shawn",
      email_address: "shawn@example.com",
      password: "s3cret!",
    };
    const user: User = { id: "user-1" };
    request.mockResolvedValueOnce(buildResponse(user));

    const result = await resource.create(payload, {
      "X-CompanyCam-User": "owner@example.com",
    });

    expect(result).toEqual(user);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/users",
      headers: { "X-CompanyCam-User": "owner@example.com" },
      data: { user: payload },
    });
  });

  it("submits mutable payloads directly when updating a user", async () => {
    // Update should forward the provided payload without additional wrapping.
    const payload: UserMutable = { phone_number: "402-555-1111" };
    const user: User = { id: "user-2" };
    request.mockResolvedValueOnce(buildResponse(user));

    const result = await resource.update("user-2", payload, {
      "X-CompanyCam-User": "admin@example.com",
    });

    expect(result).toEqual(user);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "PUT",
      url: "/users/user-2",
      headers: { "X-CompanyCam-User": "admin@example.com" },
      data: payload,
    });
  });
});

