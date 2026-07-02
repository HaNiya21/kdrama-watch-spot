import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchKDramaDetails } from "@/lib/tmdb";
import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface FeedEntry {
  id: string;
  drama_id: string;
  rating: number | null;
  notes: string | null;
  status: string;
  updated_at: string;
  display_name: string | null;
}

const fetchCommunityFeed = async (): Promise<FeedEntry[]> => {
  // Uses SECURITY DEFINER RPC that returns only review-safe fields (no user_id).
  // RPC is granted only to authenticated role.
  const { data, error } = await supabase.rpc("get_community_feed", { _limit: 50 });
  if (error) throw error;
  return (data || []) as FeedEntry[];
};


const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const FeedCard = ({ entry }: { entry: FeedEntry }) => {
  const { data: drama } = useQuery({
    queryKey: ["tmdb-detail", entry.drama_id],
    queryFn: () => fetchKDramaDetails(entry.drama_id),
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
          {(entry.display_name || "A").charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {entry.display_name || "Anonymous"}
            </span>
            {entry.rating && (
              <span className="inline-flex items-center gap-1 text-xs text-rating font-medium">
                <Star className="w-3 h-3 fill-rating" />
                rated {entry.rating}/5
              </span>
            )}
            {entry.notes && !entry.rating && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="w-3 h-3" /> reviewed
              </span>
            )}
          </div>

          {/* Drama info */}
          <a
            href={`/drama/${entry.drama_id}`}
            className="text-sm text-primary hover:underline font-medium mt-0.5 block truncate"
          >
            {drama?.title || `Drama #${entry.drama_id}`}
          </a>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(entry.updated_at)}
          </div>
        </div>

        {/* Drama poster thumbnail */}
        {drama?.poster && drama.poster !== "/placeholder.svg" && (
          <a href={`/drama/${entry.drama_id}`} className="shrink-0">
            <img
              src={drama.poster}
              alt={drama.title}
              className="w-12 h-16 rounded-md object-cover"
              loading="lazy"
            />
          </a>
        )}
      </div>

      {/* Review text */}
      {entry.notes && (
        <p className="text-sm text-foreground/80 bg-secondary/50 rounded-lg p-3 leading-relaxed">
          "{entry.notes}"
        </p>
      )}

      {/* Star display */}
      {entry.rating && (
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-4 h-4 ${
                s <= entry.rating! ? "fill-rating text-rating" : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FeedSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
    <div className="flex items-start gap-3">
      <Skeleton className="w-9 h-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-12 h-16 rounded-md" />
    </div>
    <Skeleton className="h-16 w-full rounded-lg" />
  </div>
);

const Community = () => {
  const { user } = useAuth();
  const { data: feed, isLoading } = useQuery({
    queryKey: ["community-feed"],
    queryFn: fetchCommunityFeed,
    staleTime: 1000 * 60 * 2,
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <h1 className="text-3xl font-display text-gradient mb-2">Community</h1>
        <p className="text-muted-foreground mb-8">
          Recent ratings and reviews from fellow K-drama fans
        </p>

        {!user ? (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">Sign in to see the community feed</p>
            <p className="text-sm">Reviews from fellow fans are visible to signed-in members.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => <FeedSkeleton key={i} />)}

            {feed && feed.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="text-sm">Be the first to rate and review a drama!</p>
              </div>
            )}

            {feed?.map((entry) => (
              <FeedCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};


export default Community;
