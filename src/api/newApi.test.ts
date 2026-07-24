import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDocumentationUrl, getLogs, getPublicApiEndpoint, getSelf, login, logout } from "./newApi";

function jsonResponse(data: unknown) {
  return new Response(JSON.stringify({ success: true, message: "", data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("new-api session identity", () => {
  const storage = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  };

  beforeEach(() => {
    storage.clear();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubGlobal("window", { localStorage });
  });

  it("stores the login user ID and sends it on protected requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 42, username: "member", role: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 42, username: "member", role: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await login("member", "password123");
    await getSelf();

    expect(localStorage.getItem("uid")).toBe("42");
    const protectedRequest = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(new Headers(protectedRequest.headers).get("New-Api-User")).toBe("42");
  });

  it("uses a persisted user ID when restoring an existing session", async () => {
    localStorage.setItem("uid", "77");
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ id: 77, username: "restored", role: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await getSelf();

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(new Headers(request.headers).get("New-Api-User")).toBe("77");
  });

  it("clears the persisted user ID on logout", async () => {
    localStorage.setItem("uid", "42");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse(null)));

    await logout();

    expect(localStorage.getItem("uid")).toBeNull();
  });

  it("requests consumption logs instead of login and audit records", async () => {
    localStorage.setItem("uid", "42");
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ page: 1, page_size: 20, total: 0, items: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await getLogs(false);

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("type=2");
  });

  it("uses the configured public model API endpoint without a trailing slash", () => {
    expect(getPublicApiEndpoint("https://api.example.com/v1/")).toBe("https://api.example.com/v1");
  });

  it("uses the documentation link published by new-api", () => {
    expect(getDocumentationUrl({ docs_link: "https://docs.example.com/quickstart" })).toBe(
      "https://docs.example.com/quickstart",
    );
  });
});
