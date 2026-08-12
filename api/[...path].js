const HOP_BY_HOP_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function getBody(req) {
  if (req.method === "GET" || req.method === "HEAD" || req.body === undefined) {
    return undefined;
  }
  if (Buffer.isBuffer(req.body) || typeof req.body === "string") {
    return req.body;
  }
  return JSON.stringify(req.body);
}

export function getTargetUrl(req, upstreamOrigin) {
  const pathValue = req.query.path ?? req.query["...path"];
  const path = Array.isArray(pathValue) ? pathValue.join("/") : pathValue || "";
  const targetUrl = new URL(`/api/${path}`, upstreamOrigin);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === "path" || key === "...path") {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => targetUrl.searchParams.append(key, item));
    } else if (value !== undefined) {
      targetUrl.searchParams.set(key, value);
    }
  }

  return targetUrl;
}

export default async function handler(req, res) {
  const upstreamOrigin = process.env.NEW_API_ORIGIN;

  if (!upstreamOrigin) {
    res.status(502).json({
      success: false,
      message: "NEW_API_ORIGIN is not configured. Point it to the VPS new-api origin.",
    });
    return;
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => headers.append(key, item));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  headers.delete("host");
  headers.set("x-ai-transit-proxy", "vercel");

  try {
    const upstreamResponse = await fetch(getTargetUrl(req, upstreamOrigin), {
      method: req.method,
      headers,
      body: getBody(req),
      redirect: "manual",
    });

    res.status(upstreamResponse.status);
    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const body = Buffer.from(await upstreamResponse.arrayBuffer());
    res.send(body);
  } catch (error) {
    res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to proxy new-api request.",
    });
  }
}
