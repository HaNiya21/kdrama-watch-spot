import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Tv, PlayCircle, CheckCircle2, PauseCircle, BookmarkPlus, XCircle, Star } from "lucide-react";
import { getUserWatchlist, statusLabels, type WatchlistEntry, type WatchStatus } from "@/lib/watchlist";
import { fetchKDramaDetails } from "@/lib/tmdb";

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

const WatchlistSummary = () => {
  const [entries, setEntries] = useState<WatchlistEntry[] | null>(null);

  useEffect(() => {
    getUserWatchlist().then(setEntries);
  }, []);

  const recent = (entries || []).slice(0, 5);

  const dramaQueries = useQueries({
    queries: recent.map((e) => ({
      queryKey: ["tmdb-detail", e.drama_id],
      queryFn: () => fetchKDramaDetails(e.drama_id),
      staleTime: 1000 * 60 * 15,
    })),
  });

  if (entries === null) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading watchlist…
      </div>
    );
  }

  const total = entries.length;
  const stats: { key: WatchStatus; count: number }[] = (
    ["watching", "completed", "want_to_watch", "paused", "dropped"] as WatchStatus[]
  ).map((k) => ({ key: k, count: entries.filter((e) => e.status === k).length }));

  const rated = entries.filter((e) => e.rating !== null);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, e) => sum + (e.rating || 0), 0) / rated.length).toFixed(1)
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

      {/* Status breakdown */}
      <div className="flex flex-wrap gap-2">
        {stats
          .filter((s) => s.count > 0)
          .map((s) => (
            <Link
              key={s.key}
              to="/watchlist"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors ${statusTint[s.key]}`}
            >
              {statusIcon[s.key]}
              {statusLabels[s.key]} · {s.count}
            </Link>
          ))}
      </div>

      {/* Recent updates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Recently updated</h3>
          <Link to="/watchlist" className="text-xs text-muted-foreground hover:text-foreground">See all →</Link>
        </div>
        <div className="space-y-2">
          {recent.map((entry, i) => {
            const q = dramaQueries[i];
            const drama = q?.data;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/drama/${entry.drama_id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary transition-colors group"
                >
                  <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-secondary">
                    {q?.isLoading ? (
                      <div className="w-full h-full animate-pulse" />
                    ) : drama?.poster ? (
                      <img src={drama.poster} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {drama?.title || "Loading…"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span className={`inline-flex items-center gap-1 ${statusTint[entry.status]}`}>
                        {statusIcon[entry.status]}
                        {statusLabels[entry.status]}
                      </span>
                      {entry.total_episodes > 0 && (
                        <>
                          <span>·</span>
                          <span>Ep {entry.current_episode}/{entry.total_episodes}</span>
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
                    </div>
                    {/* Episode progress bar */}
                    {entry.total_episodes > 0 && (
                      <div className="mt-1.5 h-1 rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (entry.current_episode / entry.total_episodes) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {timeAgo(entry.updated_at)}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
