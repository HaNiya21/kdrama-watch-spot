import { supabase } from "@/integrations/supabase/client";
import type { Drama } from "@/data/dramas";

const TMDB_IMG = "https://image.tmdb.org/t/p";

interface TmdbTvResult {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
  origin_country?: string[];
}

interface TmdbTvDetails {
  id: number;
  name: string;
  original_name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  first_air_date: string;
  number_of_episodes: number;
  status: string;
  genres: { id: number; name: string }[];
  networks: { name: string }[];
  credits?: {
    cast: { name: string; character: string; profile_path: string | null }[];
  };
  similar?: { results: TmdbTvResult[] };
  keywords?: { results: { id: number; name: string }[] };
}

// Genre ID → name mapping (TMDB)
const GENRE_MAP: Record<number, string> = {
  10759: "Action",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
  36: "Historical",
};

async function callProxy(action: string, params?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("tmdb-proxy", {
    body: { action, params },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

function mapTvToDrama(tv: TmdbTvResult): Drama {
  const year = tv.first_air_date ? parseInt(tv.first_air_date.substring(0, 4)) : 0;
  const genres = (tv.genre_ids || []).map(id => GENRE_MAP[id] || "Drama").filter(Boolean);
  return {
    id: String(tv.id),
    title: tv.name,
    titleKorean: tv.original_name !== tv.name ? tv.original_name : "",
    poster: tv.poster_path ? `${TMDB_IMG}/w500${tv.poster_path}` : "/placeholder.svg",
    backdrop: tv.backdrop_path ? `${TMDB_IMG}/w1280${tv.backdrop_path}` : "/placeholder.svg",
    synopsis: tv.overview || "No synopsis available.",
    genres: genres.length > 0 ? [...new Set(genres)] : ["Drama"],
    tags: [],
    cast: [],
    episodes: 0,
    airingStatus: "completed",
    rating: Math.round(tv.vote_average * 10) / 10,
    year,
    network: "",
    similarIds: [],
  };
}

function mapDetailsToDrama(d: TmdbTvDetails): Drama {
  const year = d.first_air_date ? parseInt(d.first_air_date.substring(0, 4)) : 0;
  const genres = d.genres.map(g => g.name);
  const cast = (d.credits?.cast || []).slice(0, 8).map(c => ({
    name: c.name,
    role: c.character,
    image: c.profile_path ? `${TMDB_IMG}/w185${c.profile_path}` : "",
  }));
  const tags = (d.keywords?.results || []).slice(0, 10).map(k => k.name);
  const similarIds = (d.similar?.results || [])
    .filter(s => (s.origin_country || []).includes("KR"))
    .slice(0, 6)
    .map(s => String(s.id));

  return {
    id: String(d.id),
    title: d.name,
    titleKorean: d.original_name !== d.name ? d.original_name : "",
    poster: d.poster_path ? `${TMDB_IMG}/w500${d.poster_path}` : "/placeholder.svg",
    backdrop: d.backdrop_path ? `${TMDB_IMG}/w1280${d.backdrop_path}` : "/placeholder.svg",
    synopsis: d.overview || "No synopsis available.",
    genres,
    tags,
    cast,
    episodes: d.number_of_episodes || 0,
    airingStatus: d.status === "Returning Series" || d.status === "In Production" ? "ongoing" : "completed",
    rating: Math.round(d.vote_average * 10) / 10,
    year,
    network: d.networks?.[0]?.name || "",
    similarIds,
  };
}

export async function fetchTrendingKDramas(): Promise<Drama[]> {
  const data = await callProxy("discover", { sort_by: "popularity.desc" });
  return (data.results || []).map(mapTvToDrama);
}

export async function fetchTopRatedKDramas(): Promise<Drama[]> {
  const data = await callProxy("top_rated");
  return (data.results || []).map(mapTvToDrama);
}

export async function fetchKDramasByGenre(genreId: string): Promise<Drama[]> {
  const data = await callProxy("discover", { genre_ids: genreId });
  return (data.results || []).map(mapTvToDrama);
}

export async function searchKDramas(query: string): Promise<Drama[]> {
  const data = await callProxy("search", { query });
  // Filter to Korean content when possible
  const results = (data.results || []).filter(
    (r: TmdbTvResult) => (r.origin_country || []).includes("KR")
  );
  return results.map(mapTvToDrama);
}

export async function fetchKDramaDetails(id: string): Promise<Drama> {
  const data = await callProxy("details", { id: parseInt(id) });
  return mapDetailsToDrama(data as TmdbTvDetails);
}

export async function fetchTmdbGenres(): Promise<{ id: number; name: string }[]> {
  const data = await callProxy("genres");
  return data.genres || [];
}

// Discover with pagination
export async function discoverKDramas(page = 1, genreId?: string, sortBy?: string): Promise<{ dramas: Drama[]; totalPages: number }> {
  const data = await callProxy("discover", {
    page,
    genre_ids: genreId || "",
    sort_by: sortBy || "popularity.desc",
  });
  return {
    dramas: (data.results || []).map(mapTvToDrama),
    totalPages: Math.min(data.total_pages || 1, 20),
  };
}

// Netflix K-dramas (watch provider 8 = Netflix)
export async function fetchNetflixKDramas(page = 1, sortBy = "vote_average.desc"): Promise<{ dramas: Drama[]; totalPages: number }> {
  const data = await callProxy("discover", {
    page,
    sort_by: sortBy,
    with_watch_providers: "8",
    watch_region: "US",
  });
  return {
    dramas: (data.results || []).map(mapTvToDrama),
    totalPages: Math.min(data.total_pages || 1, 20),
  };
}
