import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookmarkX } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import {
  type WatchlistEntry,
  type WatchStatus,
  statusLabels,
  statusColors,
  getUserWatchlist,
} from "@/lib/watchlist";
import { getDramaById } from "@/data/dramas";
import WatchlistTracker from "@/components/WatchlistTracker";

const statusOrder: WatchStatus[] = ["watching", "want_to_watch", "paused", "completed", "dropped"];

const Watchlist = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [filter, setFilter] = useState<WatchStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getUserWatchlist().then((data) => {
        setEntries(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Sign in to see your watchlist.</p>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? entries : entries.filter(e => e.status === filter);

  // Group by status
  const grouped = statusOrder.reduce((acc, status) => {
    const items = filtered.filter(e => e.status === status);
    if (items.length > 0) acc.push({ status, items });
    return acc;
  }, [] as { status: WatchStatus; items: WatchlistEntry[] }[]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-display text-foreground mb-2">My Watchlist</h1>
        <p className="text-muted-foreground mb-8">{entries.length} drama{entries.length !== 1 ? "s" : ""} tracked</p>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            All ({entries.length})
          </button>
          {statusOrder.map(s => {
            const count = entries.filter(e => e.status === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === s ? statusColors[s] : "bg-secondary text-secondary-foreground"}`}
              >
                {statusLabels[s]} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookmarkX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-2">Your watchlist is empty</p>
            <Link to="/browse" className="text-primary hover:underline text-sm">Browse dramas to add</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {(filter === "all" ? grouped : [{ status: filter as WatchStatus, items: filtered }]).map(({ status, items }) => (
              <div key={status}>
                {filter === "all" && (
                  <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status].split(" ")[0]}`} />
                    {statusLabels[status]}
                  </h2>
                )}
                <div className="grid gap-3">
                  {items.map((entry, i) => {
                    const drama = getDramaById(entry.drama_id);
                    if (!drama) return null;
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start"
                      >
                        <Link to={`/drama/${drama.id}`} className="w-16 flex-shrink-0">
                          <img src={drama.poster} alt={drama.title} className="w-full rounded-md" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/drama/${drama.id}`} className="text-foreground font-medium hover:text-primary transition-colors">
                            {drama.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">{drama.genres.join(" · ")} · {drama.year}</p>
                          <div className="mt-2">
                            <WatchlistTracker dramaId={drama.id} totalEpisodes={drama.episodes} onAuthRequired={() => {}} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
