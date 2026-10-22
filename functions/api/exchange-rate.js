export async function onRequestOptions({ request, env }) {
  return respond(request, env, null, 204);
}
export async function onRequestGet({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin && !isAllowedOrigin(origin, env, request)) {
    return respond(request, env, { error: "مبدأ درخواست مجاز نیست.", currency: "IRR" }, 403);
  }
  if (!env.EXCHANGE_RATE_ENDPOINT) {
    return respond(request, env, { error: "منبع نرخ ارز تنظیم نشده است.", currency: "IRR" }, 503);
  }
  try {
    const response = await fetch(env.EXCHANGE_RATE_ENDPOINT, {
      headers: env.EXCHANGE_RATE_API_KEY ? { authorization: `Bearer ${env.EXCHANGE_RATE_API_KEY}` } : {},
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error("provider error");
    const data = await response.json();
    if (data.currency !== "IRR" || !Number.isFinite(data.usdIrr) || data.usdIrr <= 0) {
      return respond(request, env, { error: "پاسخ منبع باید شامل usdIrr معتبر و currency=IRR باشد." }, 502);
    }
    return respond(request, env, {
      usdIrr: data.usdIrr,
      currency: "IRR",
      updatedAt: data.updatedAt || null,
      source: data.source || "provider"
    }, 200, { "cache-control": "public, max-age=60" });
  } catch {
    return respond(request, env, { error: "دریافت نرخ ارز ناموفق بود.", currency: "IRR" }, 502);
  }
}
function isAllowedOrigin(origin, env, request) {
  const defaults = ["https://localhost", "capacitor://localhost", "http://localhost"];
  const configured = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  let sameOrigin = false;
  try { sameOrigin = origin === new URL(request.url).origin; } catch {}
  return sameOrigin || [...defaults, ...configured].includes(origin);
}
function respond(request, env, payload, status=200, extra={}) {
  const origin = request.headers.get("Origin");
  const headers = { "content-type": "application/json; charset=utf-8", "vary": "Origin", ...extra };
  if (origin && isAllowedOrigin(origin, env, request)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "GET, OPTIONS";
    headers["access-control-allow-headers"] = "Content-Type, Authorization";
    headers["access-control-max-age"] = "86400";
  }
  return new Response(payload === null ? null : JSON.stringify(payload), { status, headers });
}
