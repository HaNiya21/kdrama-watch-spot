import { dramas, type Drama } from "@/data/dramas";
import type { WatchlistEntry } from "@/lib/watchlist";

interface ScoredDrama {
  drama: Drama;
  score: number;
  reasons: string[];
}

interface UserProfile {
  genreWeights: Record<string, number>;
  tagWeights: Record<string, number>;
  actorWeights: Record<string, number>;
  watchedIds: Set<string>;
  topRatedDramas: WatchlistEntry[];
}

/** Build a taste profile from the user's watchlist */
function buildUserProfile(entries: WatchlistEntry[]): UserProfile {
  const genreWeights: Record<string, number> = {};
  const tagWeights: Record<string, number> = {};
  const actorWeights: Record<string, number> = {};
  const watchedIds = new Set(entries.map(e => e.drama_id));

  for (const entry of entries) {
    const drama = dramas.find(d => d.id === entry.drama_id);
    if (!drama) continue;

    // Weight multiplier: completed/watching dramas matter more, high-rated even more
    let weight = 1;
    if (entry.status === "completed") weight = 2;
    if (entry.status === "watching") weight = 1.8;
    if (entry.status === "dropped") weight = -0.5;
    if (entry.rating && entry.rating >= 8) weight *= 1.5;
    if (entry.rating && entry.rating >= 9) weight *= 1.3;
    if (entry.rating && entry.rating <= 5) weight *= 0.3;

    for (const genre of drama.genres) {
      genreWeights[genre] = (genreWeights[genre] || 0) + weight;
    }
    for (const tag of drama.tags) {
      tagWeights[tag] = (tagWeights[tag] || 0) + weight;
    }
    for (const member of drama.cast) {
      actorWeights[member.name] = (actorWeights[member.name] || 0) + weight;
    }
  }

  const topRatedDramas = entries
    .filter(e => e.rating && e.rating >= 8 && (e.status === "completed" || e.status === "watching"))
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return { genreWeights, tagWeights, actorWeights, watchedIds, topRatedDramas };
}

/** Score a drama against the user's profile */
function scoreDrama(drama: Drama, profile: UserProfile): ScoredDrama {
  let score = 0;
  const reasons: string[] = [];

  // Genre matching
  for (const genre of drama.genres) {
    if (profile.genreWeights[genre]) {
      score += profile.genreWeights[genre] * 2;
      if (profile.genreWeights[genre] >= 3) {
        reasons.push(`You love ${genre} dramas`);
      }
    }
  }

  // Tag matching (stronger signal)
  let tagMatches = 0;
  for (const tag of drama.tags) {
    if (profile.tagWeights[tag]) {
      score += profile.tagWeights[tag] * 3;
      tagMatches++;
    }
  }
  if (tagMatches >= 2) {
    reasons.push(`Matches ${tagMatches} tropes you enjoy`);
  }

  // Actor matching
  for (const member of drama.cast) {
    if (profile.actorWeights[member.name]) {
      score += profile.actorWeights[member.name] * 4;
      reasons.push(`Stars ${member.name}`);
    }
  }

  // Community rating bonus
  if (drama.rating >= 9) {
    score += 3;
    reasons.push("Highly rated");
  } else if (drama.rating >= 8.5) {
    score += 1.5;
  }

  return { drama, score, reasons: [...new Set(reasons)].slice(0, 3) };
}

/** Get personalized recommendations */
export function getRecommendations(entries: WatchlistEntry[]): ScoredDrama[] {
  if (entries.length === 0) return [];

  const profile = buildUserProfile(entries);

  return dramas
    .filter(d => !profile.watchedIds.has(d.id))
    .map(d => scoreDrama(d, profile))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

/** "Because you watched X" recommendations */
export function getBecauseYouWatched(entries: WatchlistEntry[]): { source: Drama; recommendations: Drama[] }[] {
  const watchedIds = new Set(entries.map(e => e.drama_id));
  const results: { source: Drama; recommendations: Drama[] }[] = [];

  // Pick top-rated or recently watched dramas
  const relevantEntries = entries
    .filter(e => e.status === "completed" || e.status === "watching")
    .sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      return ratingDiff !== 0 ? ratingDiff : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 3);

  for (const entry of relevantEntries) {
    const source = dramas.find(d => d.id === entry.drama_id);
    if (!source) continue;

    // Find similar dramas by shared genres + tags
    const similar = dramas
      .filter(d => !watchedIds.has(d.id))
      .map(d => {
        const genreOverlap = d.genres.filter(g => source.genres.includes(g)).length;
        const tagOverlap = d.tags.filter(t => source.tags.includes(t)).length;
        const actorOverlap = d.cast.filter(c => source.cast.some(sc => sc.name === c.name)).length;
        const score = genreOverlap * 2 + tagOverlap * 3 + actorOverlap * 5;
        return { drama: d, score };
      })
      .filter(s => s.score > 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(s => s.drama);

    if (similar.length > 0) {
      results.push({ source, recommendations: similar });
    }
  }

  return results;
}

/** Mood-based suggestions */
export type Mood = "romantic" | "thrilling" | "funny" | "emotional" | "action-packed";

const moodTags: Record<Mood, string[]> = {
  romantic: ["enemies-to-lovers", "slow-burn", "forbidden-love", "love-triangle", "fate"],
  thrilling: ["revenge", "anti-hero", "mafia", "crime"],
  funny: ["comedy", "dark-comedy", "found-family"],
  emotional: ["tearjerker", "nostalgia", "slice-of-life", "family", "reincarnation"],
  "action-packed": ["military", "action-romance", "strong-leads", "mafia"],
};

const moodGenres: Record<Mood, string[]> = {
  romantic: ["Romance"],
  thrilling: ["Crime", "Thriller", "Action"],
  funny: ["Comedy"],
  emotional: ["Drama"],
  "action-packed": ["Action"],
};

export const moodLabels: Record<Mood, { emoji: string; label: string }> = {
  romantic: { emoji: "💕", label: "Romantic" },
  thrilling: { emoji: "🔥", label: "Thrilling" },
  funny: { emoji: "😂", label: "Funny" },
  emotional: { emoji: "😢", label: "Emotional" },
  "action-packed": { emoji: "⚡", label: "Action-Packed" },
};

export function getDramasByMood(mood: Mood, excludeIds: Set<string> = new Set()): Drama[] {
  const tags = moodTags[mood];
  const genres = moodGenres[mood];

  return dramas
    .filter(d => !excludeIds.has(d.id))
    .map(d => {
      const tagScore = d.tags.filter(t => tags.includes(t)).length;
      const genreScore = d.genres.filter(g => genres.includes(g)).length;
      return { drama: d, score: tagScore * 2 + genreScore };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(s => s.drama);
}
