export async function onRequestOptions({ request, env }) {
  return corsResponse(request, env, null, 204);
}
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (!isAllowedOrigin(origin, env, request)) return json({ error: "مبدأ درخواست مجاز نیست." }, 403, request, env);
  let body;
  try { body = await request.json(); } catch { return json({ error: "درخواست JSON معتبر نیست." }, 400, request, env); }
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const targetLanguage = typeof body?.targetLanguage === "string" ? body.targetLanguage : "Persian";
  if (!text) return json({ error: "متن برای ترجمه خالی است." }, 400, request, env);
  if (text.length > 12000) return json({ error: "متن بیش از حد طولانی است." }, 413, request, env);
  if (!env.AI || !env.TRANSLATION_MODEL) return json({ error: "Cloudflare Workers AI یا TRANSLATION_MODEL پیکربندی نشده است." }, 503, request, env);
  try {
    const result = await env.AI.run(env.TRANSLATION_MODEL, {
      messages: [
        { role: "system", content: `Translate the user's text into ${targetLanguage}. Preserve meaning, names, dates, figures, quotes and paragraph structure. Do not add facts or commentary. Return only the translation.` },
        { role: "user", content: text }
      ]
    });
    const translation = result?.response || result?.choices?.[0]?.message?.content;
    if (typeof translation !== "string" || !translation.trim()) return json({ error: "پاسخ مدل ترجمه قابل استفاده نیست." }, 502, request, env);
    return json({ translation: translation.trim(), model: env.TRANSLATION_MODEL }, 200, request, env);
  } catch {
    return json({ error: "خطا در سرویس ترجمه. بعداً دوباره تلاش کنید." }, 502, request, env);
  }
}
function isAllowedOrigin(origin, env, request) {
  if (!origin) return true;
  const defaults = ["https://localhost", "capacitor://localhost", "http://localhost"];
  const configured = (env.ALLOWED_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
  let sameOrigin = false;
  try { sameOrigin = origin === new URL(request.url).origin; } catch {}
  return sameOrigin || [...defaults, ...configured].includes(origin);
}
function corsResponse(request, env, payload, status=200) {
  const origin = request.headers.get("Origin");
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "vary": "Origin" };
  if (origin && isAllowedOrigin(origin, env, request)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "POST, OPTIONS";
    headers["access-control-allow-headers"] = "Content-Type";
    headers["access-control-max-age"] = "86400";
  }
  return new Response(payload === null ? null : JSON.stringify(payload), { status, headers });
}
function json(data,status=200,request,env){ return corsResponse(request, env, data, status); }
