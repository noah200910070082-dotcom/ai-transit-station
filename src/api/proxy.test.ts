import { describe, expect, it } from "vitest";

// @ts-expect-error Vercel executes this JavaScript serverless function directly.
import { getTargetUrl } from "../../api/[...path].js";

describe("getTargetUrl", () => {
  it("supports Vercel's catch-all query key", () => {
    const request = {
      query: {
        "...path": "status",
      },
    };

    expect(getTargetUrl(request, "http://43.160.247.100").toString()).toBe(
      "http://43.160.247.100/api/status",
    );
  });
});
