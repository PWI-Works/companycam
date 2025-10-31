import type { AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HttpClient } from "../../src/http/HttpClient.js";
import type { Webhook, WebhookMutable } from "../../src/interfaces.js";
import { WebhooksResource } from "../../src/resources/Webhooks.js";

// Helper to mirror the Axios response signature.
function buildResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {} as any,
    config: { headers: {} as any },
  };
}

describe("WebhooksResource", () => {
  let request: ReturnType<typeof vi.fn>;
  let resource: WebhooksResource;

  beforeEach(() => {
    request = vi.fn();
    const http = { request } as unknown as HttpClient;
    resource = new WebhooksResource(http);
  });

  it("creates webhooks using the shared mutable payload", async () => {
    const payload: WebhookMutable = {
      url: "https://example.com/hook",
      scopes: ["projects.*"],
    };
    const webhook: Webhook = { id: "wh-1" };
    request.mockResolvedValueOnce(buildResponse(webhook));

    const result = await resource.create(payload, { authToken: "token" });

    expect(result).toEqual(webhook);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "POST",
      url: "/webhooks",
      authToken: "token",
      data: payload,
    });
  });

  it("updates webhooks without altering the mutable payload", async () => {
    const payload: WebhookMutable = { enabled: true };
    const webhook: Webhook = { id: "wh-2" };
    request.mockResolvedValueOnce(buildResponse(webhook));

    const result = await resource.update("wh-2", payload);

    expect(result).toEqual(webhook);
    expect(request).toHaveBeenCalledTimes(1);
    const call = request.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      method: "PUT",
      url: "/webhooks/wh-2",
      data: payload,
    });
  });
});

