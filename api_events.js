export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  try {
    const pageId = process.env.FB_PAGE_ID;
    const token  = process.env.FB_TOKEN;

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

    const url = new URL(`https://graph.facebook.com/v22.0/${pageId}/events`);
    url.searchParams.set("time_filter", "upcoming");
    url.searchParams.set("limit", "25");
    url.searchParams.set("fields", fields);
    url.searchParams.set("access_token", token);

    const fbRes = await fetch(url.toString());
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ events });
  } catch (error) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ events: [], error: String(error) });
  }
}
