export default {
  async fetch(request, env) {
    const origin = new URL(request.headers.get("Origin") || request.url).origin;
    const allowOrigin = origin; // optionally pin to your domain string

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allowOrigin) });
    }

    try {
      const pageId = env.FB_PAGE_ID;
      const token  = env.FB_TOKEN;

      const fields = [
        "id",
        "name",
        "start_time",
        "end_time",
        "place{name,location{city,state,country,street,zip}}",
        "description",
        "cover{source}",
        "event_times"
      ].join(",");

      const graphUrl = new URL(`https://graph.facebook.com/v22.0/${pageId}/events`);
      graphUrl.searchParams.set("time_filter", "upcoming");
      graphUrl.searchParams.set("limit", "25");
      graphUrl.searchParams.set("fields", fields);
      graphUrl.searchParams.set("access_token", token);

      // Cache for 10 minutes at the edge
      const cache = caches.default;
      const cacheKey = new Request(graphUrl.toString(), { method: "GET" });
      let resp = await cache.match(cacheKey);

      if (!resp) {
        const fbRes = await fetch(graphUrl.toString(), { method: "GET" });
        const payload = await fbRes.json();

        const events = (payload.data || []).map(e => ({
          id: e.id,
          title: e.name,
          starts: e.start_time,
          ends: e.end_time || null,
          cover: e.cover?.source || null,
          place: e.place?.name || null,
          addr: e.place?.location || null,
          description: e.description || ""
        }));

        resp = new Response(JSON.stringify({ events }, null, 2), {
          headers: { "Content-Type": "application/json; charset=utf-8" }
        });
        resp.headers.set("Cache-Control", "public, max-age=600, s-maxage=600");
        await cache.put(cacheKey, resp.clone());
      }

      return withCors(resp, allowOrigin);
    } catch (err) {
      const error = new Response(JSON.stringify({ events: [], error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
      return withCors(error, allowOrigin);
    }
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function withCors(resp, origin) {
  const r = new Response(resp.body, resp);
  Object.entries(corsHeaders(origin)).forEach(([k, v]) => r.headers.set(k, v));
  return r;
}
