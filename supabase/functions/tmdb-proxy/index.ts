import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TMDB_BASE = "https://api.themoviedb.org/3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
  if (!TMDB_API_KEY) {
    return new Response(
      JSON.stringify({ error: "TMDB_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { action, params } = await req.json();

    let url: string;
    switch (action) {
      case "discover": {
        // Discover Korean dramas sorted by popularity
        const page = params?.page || 1;
        const sortBy = params?.sort_by || "popularity.desc";
        const genres = params?.genre_ids || "";
        const watchProviders = params?.with_watch_providers || "";
        const watchRegion = params?.watch_region || "";
        const providerQs = watchProviders
          ? `&with_watch_providers=${watchProviders}&watch_region=${watchRegion || "US"}&with_watch_monetization_types=flatrate`
          : "";
        url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ko&sort_by=${sortBy}&page=${page}&with_genres=${genres}&include_adult=false${providerQs}`;
        break;
      }
      case "trending": {
        url = `${TMDB_BASE}/trending/tv/week?api_key=${TMDB_API_KEY}&language=en-US`;
        break;
      }
      case "search": {
        const query = encodeURIComponent(params?.query || "");
        url = `${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${query}&language=en-US&include_adult=false`;
        break;
      }
      case "details": {
        const id = params?.id;
        if (!id) throw new Error("Missing id parameter");
        url = `${TMDB_BASE}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,similar,keywords`;
        break;
      }
      case "top_rated": {
        const page = params?.page || 1;
        url = `${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=50&page=${page}&include_adult=false`;
        break;
      }
      case "person": {
        const pid = parseInt(params?.id);
        if (!pid) throw new Error("Missing id parameter");
        url = `${TMDB_BASE}/person/${pid}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=combined_credits`;
        break;
      }
      case "genres": {
        url = `${TMDB_BASE}/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`;
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `TMDB API error [${response.status}]: ${JSON.stringify(data)}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tmdb-proxy error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
