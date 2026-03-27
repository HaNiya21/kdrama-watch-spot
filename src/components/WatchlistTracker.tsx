import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookmarkPlus, ChevronDown, Minus, Plus, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  type WatchStatus,
  type WatchlistEntry,
  statusLabels,
  statusColors,
  getWatchlistEntry,
  upsertWatchlistEntry,
  removeFromWatchlist,
} from "@/lib/watchlist";

interface WatchlistTrackerProps {
  dramaId: string;
  totalEpisodes: number;
  onAuthRequired: () => void;
}

const WatchlistTracker = ({ dramaId, totalEpisodes, onAuthRequired }: WatchlistTrackerProps) => {
  const { user } = useAuth();
  const [entry, setEntry] = useState<WatchlistEntry | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getWatchlistEntry(dramaId).then(setEntry);
    } else {
      setEntry(null);
    }
  }, [user, dramaId]);

  const handleStatusChange = async (status: WatchStatus) => {
    if (!user) { onAuthRequired(); return; }
    setLoading(true);
    const ep = status === "completed" ? totalEpisodes : entry?.current_episode || 0;
    const result = await upsertWatchlistEntry(dramaId, {
      status,
      current_episode: ep,
      total_episodes: totalEpisodes,
    });
    setEntry(result);
    setShowDropdown(false);
    setLoading(false);
  };

  const handleEpisodeChange = async (delta: number) => {
    if (!entry) return;
    const newEp = Math.max(0, Math.min(totalEpisodes, entry.current_episode + delta));
    const newStatus = newEp === totalEpisodes ? "completed" : newEp > 0 ? "watching" : entry.status;
    const result = await upsertWatchlistEntry(dramaId, {
      current_episode: newEp,
      status: newStatus,
    });
    setEntry(result);
  };

  const handleRemove = async () => {
    await removeFromWatchlist(dramaId);
    setEntry(null);
  };

  if (!entry) {
    return (
      <button
        onClick={() => user ? handleStatusChange("want_to_watch") : onAuthRequired()}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <BookmarkPlus className="w-5 h-5" />
        Add to Watchlist
      </button>
    );
  }

  const statuses: WatchStatus[] = ["want_to_watch", "watching", "completed", "paused", "dropped"];

  return (
    <div className="space-y-3">
      {/* Status selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${statusColors[entry.status]}`}
        >
          {statusLabels[entry.status]}
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-[var(--shadow-card)] overflow-hidden z-20 min-w-[180px]"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                    entry.status === s ? "text-primary bg-primary/10" : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {statusLabels[s]}
                </button>
              ))}
              <hr className="border-border" />
              <button
                onClick={handleRemove}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Episode tracker */}
      {(entry.status === "watching" || entry.status === "paused") && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Episode Progress</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEpisodeChange(-1)}
              className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
              {entry.current_episode} / {totalEpisodes}
            </span>
            <button
              onClick={() => handleEpisodeChange(1)}
              className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex-1 max-w-[120px] h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(entry.current_episode / totalEpisodes) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchlistTracker;
