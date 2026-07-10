import { supabase } from "@/integrations/supabase/client";

export type WatchStatus = "want_to_watch" | "watching" | "completed" | "paused" | "dropped";

export interface WatchlistEntry {
  id: string;
  user_id: string;
  drama_id: string;
  status: WatchStatus;
  current_episode: number;
  total_episodes: number;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const statusLabels: Record<WatchStatus, string> = {
  want_to_watch: "Want to Watch",
  watching: "Watching",
  completed: "Completed",
  paused: "Paused",
  dropped: "Dropped",
};

export const statusColors: Record<WatchStatus, string> = {
  want_to_watch: "bg-accent text-accent-foreground",
  watching: "bg-primary text-primary-foreground",
  completed: "bg-emerald-600 text-white",
  paused: "bg-amber-600 text-white",
  dropped: "bg-destructive text-destructive-foreground",
};

const WATCHLIST_COLUMNS =
  "id, drama_id, status, current_episode, total_episodes, rating, notes, created_at, updated_at";

export async function getWatchlistEntry(dramaId: string): Promise<WatchlistEntry | null> {
  const { data } = await supabase
    .from("watchlist")
    .select(WATCHLIST_COLUMNS)
    .eq("drama_id", dramaId)
    .maybeSingle();
  return data as WatchlistEntry | null;
}

export async function getUserWatchlist(): Promise<WatchlistEntry[]> {
  const { data } = await supabase
    .from("watchlist")
    .select(WATCHLIST_COLUMNS)
    .order("updated_at", { ascending: false });
  return (data as WatchlistEntry[]) || [];
}

export async function upsertWatchlistEntry(
  dramaId: string,
  updates: Partial<Pick<WatchlistEntry, "status" | "current_episode" | "total_episodes" | "rating" | "notes">>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Write without RETURNING — the column-level RLS on `watchlist` (user_id is
  // not granted to authenticated) makes PostgREST's default returning path
  // fail with "permission denied for table watchlist". We re-fetch after.
  const { error } = await supabase
    .from("watchlist")
    .upsert(
      { user_id: user.id, drama_id: dramaId, ...updates },
      { onConflict: "user_id,drama_id" }
    );

  if (error) throw error;
  const entry = await getWatchlistEntry(dramaId);
  if (!entry) throw new Error("Failed to load watchlist entry after save");
  return entry;
}

export async function removeFromWatchlist(dramaId: string) {
  const { error } = await supabase
    .from("watchlist")
    .delete()
    .eq("drama_id", dramaId);
  if (error) throw error;
}
