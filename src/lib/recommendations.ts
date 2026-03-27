import type { Drama } from "@/data/dramas";
import type { WatchlistEntry } from "@/lib/watchlist";
import { fetchKDramaDetails, discoverKDramas } from "@/lib/tmdb";

export interface ScoredDrama {
  drama: Drama;
  score: number;
  reasons: string[];
}

export type Mood = "romantic" | "thrilling" | "funny" | "emotional" | "action-packed";

export const moodLabels: Record<Mood, { emoji: string; label: string }> = {
  romantic: { emoji: "💕", label: "Romantic" },
  thrilling: { emoji: "🔥", label: "Thrilling" },
  funny: { emoji: "😂", label: "Funny" },
  emotional: { emoji: "😢", label: "Emotional" },
  "action-packed": { emoji: "⚡", label: "Action-Packed" },
};

// TMDB genre IDs for mood-based discovery
const moodGenreIds: Record<Mood, string> = {
  romantic: "10749",
  thrilling: "80,9648",
  funny: "35",
  emotional: "18",
  "action-packed": "10759,10768",
};

/** Fetch TMDB details for watchlist entries (cached per session via react-query externally) */
async function fetchWatchlistDramas(entries: WatchlistEntry[]): Promise<Map<string, Drama>> {
  const map = new Map<string, Drama>();
  const fetches = entries.map(async (e) => {
    try {
      const drama = await fetchKDramaDetails(e.drama_id);
      map.set(e.drama_id, drama);
    } catch {
      // skip entries that fail to fetch
    }
  });
  await Promise.all(fetches);
  return map;
}

interface UserProfile {
  genreWeights: Record<string, number>;
  topGenreIds: string[];
  actorNames: Set<string>;
  watchedIds: Set<string>;
}

function buildProfile(entries: WatchlistEntry[], dramaMap: Map<string, Drama>): UserProfile {
  const genreWeights: Record<string, number> = {};
  const actorNames = new Set<string>();
  const watchedIds = new Set(entries.map(e => e.drama_id));

  for (const entry of entries) {
    const drama = dramaMap.get(entry.drama_id);
    if (!drama) continue;

    let weight = 1;
    if (entry.status === "completed") weight = 2;
    if (entry.status === "watching") weight = 1.8;
    if (entry.status === "dropped") weight = -0.5;
    if (entry.rating && entry.rating >= 4) weight *= 1.5;
    if (entry.rating && entry.rating === 5) weight *= 1.3;
    if (entry.rating && entry.rating <= 2) weight *= 0.3;

    for (const genre of drama.genres) {
      genreWeights[genre] = (genreWeights[genre] || 0) + weight;
    }
    for (const member of drama.cast) {
      actorNames.add(member.name);
    }
  }

  // Map top genre names to TMDB genre IDs
  const genreNameToId: Record<string, string> = {
    "Drama": "18", "Comedy": "35", "Romance": "10749", "Action": "10759",
    "Action & Adventure": "10759", "Sci-Fi & Fantasy": "10765", "Fantasy": "10765",
    "Mystery": "9648", "Crime": "80", "War & Politics": "10768", "Family": "10751",
    "Animation": "16", "Documentary": "99", "Soap": "10766",
  };

  const topGenreIds = Object.entries(genreWeights)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => genreNameToId[name])
    .filter(Boolean) as string[];

  return { genreWeights, topGenreIds, actorNames, watchedIds };
}

function scoreDrama(drama: Drama, profile: UserProfile): ScoredDrama {
  let score = 0;
  const reasons: string[] = [];

  for (const genre of drama.genres) {
    if (profile.genreWeights[genre]) {
      score += profile.genreWeights[genre] * 2;
      if (profile.genreWeights[genre] >= 3) {
        reasons.push(`You love ${genre} dramas`);
      }
    }
  }

  for (const member of drama.cast) {
    if (profile.actorNames.has(member.name)) {
      score += 4;
      reasons.push(`Stars ${member.name}`);
    }
  }

  if (drama.rating >= 8.5) {
    score += 2;
    reasons.push("Highly rated");
  }

  return { drama, score, reasons: [...new Set(reasons)].slice(0, 3) };
}

/** Get personalized recommendations using TMDB data */
export async function getRecommendations(entries: WatchlistEntry[]): Promise<ScoredDrama[]> {
  if (entries.length === 0) return [];

  const dramaMap = await fetchWatchlistDramas(entries);
  const profile = buildProfile(entries, dramaMap);

  // Fetch dramas from TMDB using top genres
  const genreParam = profile.topGenreIds.join(",");
  const [page1, page2] = await Promise.all([
    discoverKDramas(1, genreParam || undefined, "vote_average.desc"),
    discoverKDramas(2, genreParam || undefined, "popularity.desc"),
  ]);

  const allCandidates = [...page1.dramas, ...page2.dramas];

  // Deduplicate and exclude watched
  const seen = new Set<string>();
  const unique = allCandidates.filter(d => {
    if (seen.has(d.id) || profile.watchedIds.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  return unique
    .map(d => scoreDrama(d, profile))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** "Because you watched X" — uses TMDB similar endpoint */
export async function getBecauseYouWatched(
  entries: WatchlistEntry[]
): Promise<{ source: Drama; recommendations: Drama[] }[]> {
  if (entries.length === 0) return [];

  const watchedIds = new Set(entries.map(e => e.drama_id));

  const relevantEntries = entries
    .filter(e => e.status === "completed" || e.status === "watching")
    .sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      return ratingDiff !== 0 ? ratingDiff : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 3);

  const results: { source: Drama; recommendations: Drama[] }[] = [];

  for (const entry of relevantEntries) {
    try {
      const source = await fetchKDramaDetails(entry.drama_id);
      // similarIds are populated from TMDB's similar endpoint in fetchKDramaDetails
      if (source.similarIds.length > 0) {
        const similarFetches = source.similarIds.slice(0, 4).map(id =>
          fetchKDramaDetails(id).catch(() => null)
        );
        const similar = (await Promise.all(similarFetches))
          .filter((d): d is Drama => d !== null && !watchedIds.has(d.id));

        if (similar.length > 0) {
          results.push({ source, recommendations: similar });
        }
      }
    } catch {
      // skip
    }
  }

  return results;
}

/** Mood-based suggestions via TMDB discover */
export async function getDramasByMood(mood: Mood, excludeIds: Set<string> = new Set()): Promise<Drama[]> {
  const genreId = moodGenreIds[mood];
  const { dramas } = await discoverKDramas(1, genreId, "popularity.desc");
  return dramas.filter(d => !excludeIds.has(d.id)).slice(0, 6);
}
