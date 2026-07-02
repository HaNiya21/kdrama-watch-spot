import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Loader2, Tv, PlayCircle, CheckCircle2, PauseCircle, Bookmark, XCircle,
  Star, Plus, Check,
} from "lucide-react";
import {
  getUserWatchlist, upsertWatchlistEntry, statusLabels,
  type WatchlistEntry, type WatchStatus,
} from "@/lib/watchlist";
import { fetchKDramaDetails } from "@/lib/tmdb";
import { toast } from "@/hooks/use-toast";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const statusIcon: Record<WatchStatus, React.ReactNode> = {
  watching: <PlayCircle className="w-4 h-4" />,
  want_to_watch: <BookmarkPlus className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
  paused: <PauseCircle className="w-4 h-4" />,
  dropped: <XCircle className="w-4 h-4" />,
};

const statusTint: Record<WatchStatus, string> = {
  watching: "text-primary",
  want_to_watch: "text-accent-foreground",
  completed: "text-emerald-500",
  paused: "text-amber-500",
  dropped: "text-destructive",
};

type Filter = "all" | WatchStatus;
const filterOrder: WatchStatus[] = ["watching", "want_to_watch", "completed", "paused", "dropped"];

const WatchlistSummary = () => {
  const [entries, setEntries] = useState<WatchlistEntry[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getUserWatchlist().then(setEntries);
  }, []);

  const filtered = useMemo(
    () => (entries || []).filter((e) => filter === "all" || e.status === filter),
    [entries, filter]
  );
  const recent = filtered.slice(0, 6);

  const rated = useMemo(
    () =>
      (entries || [])
        .filter((e) => e.rating !== null)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5),
    [entries]
  );

  // Prefetch drama metadata for both lists (dedupe by id)
  const dramaIds = useMemo(
    () => Array.from(new Set([...recent.map((e) => e.drama_id), ...rated.map((e) => e.drama_id)])),
    [recent, rated]
  );
  const dramaQueries = useQueries({
    queries: dramaIds.map((id) => ({
      queryKey: ["tmdb-detail", id],
      queryFn: () => fetchKDramaDetails(id),
      staleTime: 1000 * 60 * 15,
    })),
  });
  const dramaById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof mapQuery>>();
    dramaIds.forEach((id, i) => map.set(id, mapQuery(dramaQueries[i])));
    return map;
  }, [dramaIds, dramaQueries]);

  const handleMarkNextEpisode = async (entry: WatchlistEntry) => {
    if (updatingId) return;
    const total = entry.total_episodes || dramaById.get(entry.drama_id)?.episodes || 0;
    if (total > 0 && entry.current_episode >= total) return;
    const next = entry.current_episode + 1;
    const willComplete = total > 0 && next >= total;

    setUpdatingId(entry.id);
    try {
      const updated = await upsertWatchlistEntry(entry.drama_id, {
        current_episode: next,
        total_episodes: total || undefined,
        status: willComplete ? "completed" : entry.status === "want_to_watch" ? "watching" : entry.status,
      });
      setEntries((prev) =>
        (prev || []).map((e) => (e.id === entry.id ? { ...e, ...updated } : e))
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      );
      toast({
        title: willComplete ? "Marked as completed!" : `Episode ${next} watched`,
      });
    } catch (err) {
      toast({
        title: "Couldn't update progress",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (entries === null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading watchlist…
      </div>
    );
  }

  const total = entries.length;
  const stats: { key: WatchStatus; count: number }[] = filterOrder.map((k) => ({
    key: k,
    count: entries.filter((e) => e.status === k).length,
  }));

  const ratedAll = entries.filter((e) => e.rating !== null);
  const avgRating =
    ratedAll.length > 0
      ? (ratedAll.reduce((sum, e) => sum + (e.rating || 0), 0) / ratedAll.length).toFixed(1)
      : null;
  const episodesWatched = entries.reduce((sum, e) => sum + (e.current_episode || 0), 0);

  if (total === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-border rounded-xl">
        <Tv className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-3">You haven't tracked any dramas yet.</p>
        <Link to="/browse" className="text-sm text-primary hover:underline">Browse dramas →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top-line stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tracked" value={total} />
        <StatCard label="Episodes watched" value={episodesWatched} />
        <StatCard label="Completed" value={stats.find((s) => s.key === "completed")?.count || 0} />
        <StatCard
          label="Avg. rating"
          value={avgRating ? `${avgRating} / 5` : "—"}
          icon={avgRating ? <Star className="w-4 h-4 fill-rating text-rating" /> : undefined}
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All · {total}
        </FilterChip>
        {stats
          .filter((s) => s.count > 0)
          .map((s) => (
            <FilterChip
              key={s.key}
              active={filter === s.key}
              onClick={() => setFilter(s.key)}
              tintClass={statusTint[s.key]}
            >
              {statusIcon[s.key]}
              {statusLabels[s.key]} · {s.count}
            </FilterChip>
          ))}
      </div>

      {/* Recent updates (filter-aware) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">
            {filter === "all" ? "Recently updated" : `Recent · ${statusLabels[filter as WatchStatus]}`}
          </h3>
          <Link to="/watchlist" className="text-xs text-muted-foreground hover:text-foreground">
            See all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
            Nothing here yet.
          </p>
        ) : (
          <div className="space-y-2">
            {recent.map((entry, i) => {
              const drama = dramaById.get(entry.drama_id);
              const total = entry.total_episodes || drama?.episodes || 0;
              const isDone = total > 0 && entry.current_episode >= total;
              const canProgress = !isDone && entry.status !== "dropped";
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-colors"
                >
                  <Link to={`/drama/${entry.drama_id}`} className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-secondary">
                    {drama?.isLoading ? (
                      <div className="w-full h-full animate-pulse" />
                    ) : drama?.poster ? (
                      <img src={drama.poster} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/drama/${entry.drama_id}`}
                      className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors block"
                    >
                      {drama?.title || "Loading…"}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      <span className={`inline-flex items-center gap-1 ${statusTint[entry.status]}`}>
                        {statusIcon[entry.status]}
                        {statusLabels[entry.status]}
                      </span>
                      {total > 0 && (
                        <>
                          <span>·</span>
                          <span>Ep {entry.current_episode}/{total}</span>
                        </>
                      )}
                      {entry.rating !== null && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-rating text-rating" />
                            {entry.rating}
                          </span>
                        </>
                      )}
                      <span>·</span>
                      <span>{timeAgo(entry.updated_at)}</span>
                    </div>
                    {total > 0 && (
                      <div className="mt-1.5 h-1 rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (entry.current_episode / total) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  {canProgress ? (
                    <button
                      onClick={() => handleMarkNextEpisode(entry)}
                      disabled={updatingId === entry.id}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      title={`Mark episode ${entry.current_episode + 1} watched`}
                    >
                      {updatingId === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      Ep {entry.current_episode + 1}
                    </button>
                  ) : isDone ? (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium">
                      <Check className="w-3.5 h-3.5" /> Done
                    </span>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Rated */}
      {rated.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Recently rated</h3>
            <span className="text-xs text-muted-foreground">{ratedAll.length} total</span>
          </div>
          <div className="space-y-2">
            {rated.map((entry, i) => {
              const drama = dramaById.get(entry.drama_id);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    to={`/drama/${entry.drama_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary transition-colors group"
                  >
                    <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-secondary">
                      {drama?.poster && <img src={drama.poster} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {drama?.title || "Loading…"}
                      </p>
                      <div className="flex items-center gap-1 mt-1" aria-label={`${entry.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              n <= (entry.rating || 0)
                                ? "fill-rating text-rating"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {entry.rating} · {timeAgo(entry.updated_at)}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{entry.notes}"</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function mapQuery(q: { data?: { title: string; poster: string; episodes: number }; isLoading: boolean }) {
  return {
    title: q.data?.title,
    poster: q.data?.poster,
    episodes: q.data?.episodes || 0,
    isLoading: q.isLoading,
  };
}

const FilterChip = ({
  active, onClick, children, tintClass,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tintClass?: string;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
      active
        ? "bg-primary text-primary-foreground"
        : `bg-secondary hover:bg-secondary/80 ${tintClass || "text-foreground"}`
    }`}
  >
    {children}
  </button>
);

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
  <div className="bg-secondary/40 border border-border rounded-lg p-3">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-xl font-display text-foreground inline-flex items-center gap-1.5">
      {icon}
      {value}
    </p>
  </div>
);

export default WatchlistSummary;
