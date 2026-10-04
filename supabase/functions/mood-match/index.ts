import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText } from "npm:ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};
const TMDB = "https://api.themoviedb.org/3";
const MODEL = "openai/gpt-6-astra";

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });

interface Show { id: number; name: string; overview: string; genre_ids: number[]; vote_average: number; first_air_date: string; poster_path: string | null }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const tmdbKey = Deno.env.get("TMDB_API_KEY");
  const aiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!tmdbKey || !aiKey) return json({ error: "Service is not configured" }, 500);

  let prompt = "";
  try {
    prompt = String((await req.json())?.prompt ?? "").trim().slice(0, 600);
  } catch { /* ignore */ }
  if (prompt.length < 3) return json({ error: "Please describe what you're in the mood for." }, 400);

  // Build catalog: popular + top rated Korean dramas, plus shows of actors named in the prompt
  const urls: string[] = [];
  for (let p = 1; p <= 4; p++) urls.push(`${TMDB}/discover/tv?api_key=${tmdbKey}&with_original_language=ko&sort_by=popularity.desc&page=${p}&include_adult=false`);
  for (let p = 1; p <= 3; p++) urls.push(`${TMDB}/discover/tv?api_key=${tmdbKey}&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=50&page=${p}`);
  const [pages, genresRes] = await Promise.all([
    Promise.all(urls.map((u) => fetch(u).then((r) => r.json()).catch(() => ({ results: [] })))),
    fetch(`${TMDB}/genre/tv/list?api_key=${tmdbKey}`).then((r) => r.json()).catch(() => ({ genres: [] })),
  ]);
  const genreMap = new Map<number, string>((genresRes.genres ?? []).map((g: any) => [g.id, g.name]));
  const catalog = new Map<number, Show & { cast?: string }>();
  for (const pg of pages) for (const s of pg.results ?? []) if (!catalog.has(s.id)) catalog.set(s.id, s);

  // Actor-aware: search people mentioned in the prompt (best effort)
  try {
    const people = await fetch(`${TMDB}/search/person?api_key=${tmdbKey}&query=${encodeURIComponent(prompt)}`).then((r) => r.json());
    const top = (people.results ?? []).filter((p: any) => p.popularity > 3).slice(0, 2);
    for (const person of top) {
      const credits = await fetch(`${TMDB}/person/${person.id}/tv_credits?api_key=${tmdbKey}`).then((r) => r.json());
      for (const s of (credits.cast ?? []).filter((c: any) => c.original_language === "ko").slice(0, 20)) {
        const existing = catalog.get(s.id) ?? s;
        catalog.set(s.id, { ...existing, cast: [existing.cast, person.name].filter(Boolean).join(", ") });
      }
    }
  } catch { /* optional */ }

  const list = [...catalog.values()].map((s) =>
    `${s.id} | ${s.name} (${(s.first_air_date || "").slice(0, 4)}) | ${s.genre_ids.map((g) => genreMap.get(g)).filter(Boolean).join("/")} | ★${s.vote_average?.toFixed(1)}${s.cast ? ` | stars ${s.cast}` : ""} | ${(s.overview || "").slice(0, 220)}`
  ).join("\n");

  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: aiKey,
    headers: { "Lovable-API-Key": aiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      abortSignal: req.signal,
      system:
        "You are KDramaDex's K-drama matchmaker. Pick shows ONLY from the provided catalog (use their exact numeric ids). Match the user's mood, tropes and actors. Return ONLY JSON: {\"summary\": string (1 sentence), \"picks\": [{\"id\": number, \"reason\": string (max 25 words, mention the matching tropes/mood)}]} with 6 to 8 picks, best first. No markdown.",
      prompt: `User request: ${prompt}\n\nCatalog (id | title (year) | genres | rating | cast | overview):\n${list}`,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { picks: [] };
    const picks = (Array.isArray(parsed.picks) ? parsed.picks : [])
      .map((p: any) => {
        const s = catalog.get(Number(p.id));
        if (!s) return null;
        return {
          id: s.id,
          title: s.name,
          year: (s.first_air_date || "").slice(0, 4),
          rating: s.vote_average,
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
          genres: s.genre_ids.map((g) => genreMap.get(g)).filter(Boolean),
          reason: String(p.reason ?? "").slice(0, 240),
        };
      })
      .filter(Boolean)
      .slice(0, 8);
    return json({ summary: String(parsed.summary ?? ""), picks });
  } catch (e: any) {
    const status = e?.statusCode ?? e?.lastError?.statusCode ?? 500;
    console.error("mood-match error", status, e?.message);
    const msg =
      status === 429 ? "Too many requests right now — please try again in a moment." :
      status === 402 ? "AI credits have run out. Add credits in Settings → Plans & credits." :
      status === 403 ? "AI access is currently blocked for this workspace." :
      "Couldn't get recommendations. Please try again.";
    return json({ error: msg }, [402, 403, 429].includes(status) ? status : 500);
  }
});
