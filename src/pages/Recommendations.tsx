import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import DramaCard from "@/components/DramaCard";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWatchlist, type WatchlistEntry } from "@/lib/watchlist";
import {
  getRecommendations,
  getBecauseYouWatched,
  getDramasByMood,
  moodLabels,
  type Mood,
} from "@/lib/recommendations";

const moods: Mood[] = ["romantic", "thrilling", "funny", "emotional", "action-packed"];

const Recommendations = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

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

  const watchedIds = new Set(entries.map(e => e.drama_id));
  const personalized = getRecommendations(entries);
  const becauseYouWatched = getBecauseYouWatched(entries);
  const moodDramas = selectedMood ? getDramasByMood(selectedMood, watchedIds) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-primary" />
          <h1 className="text-4xl font-display text-foreground">For You</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          {user && entries.length > 0
            ? "Personalized picks based on your taste"
            : "Sign in and track some dramas to get personalized recommendations"}
        </p>

        {/* Mood-based section */}
        <section className="mb-12">
          <h2 className="text-2xl font-display text-foreground mb-4">What's Your Mood?</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedMood === mood
                    ? "bg-primary text-primary-foreground scale-105"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {moodLabels[mood].emoji} {moodLabels[mood].label}
              </button>
            ))}
          </div>
          {selectedMood && moodDramas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {moodDramas.map((drama, i) => (
                <DramaCard key={drama.id} drama={drama} index={i} />
              ))}
            </motion.div>
          )}
        </section>

        {/* Personalized recommendations */}
        {user && entries.length > 0 && !loading && (
          <>
            {personalized.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-display text-foreground mb-2">Recommended for You</h2>
                <p className="text-sm text-muted-foreground mb-5">Based on your watching history and ratings</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {personalized.slice(0, 6).map(({ drama, reasons }, i) => (
                    <div key={drama.id}>
                      <DramaCard drama={drama} index={i} />
                      {reasons.length > 0 && (
                        <p className="text-[11px] text-primary/80 mt-1 px-1 line-clamp-2">
                          {reasons[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Because you watched */}
            {becauseYouWatched.map(({ source, recommendations }) => (
              <section key={source.id} className="mb-12">
                <h2 className="text-2xl font-display text-foreground mb-1">
                  Because you watched{" "}
                  <Link to={`/drama/${source.id}`} className="text-primary hover:underline">
                    {source.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Similar vibes you might enjoy</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {recommendations.map((drama, i) => (
                    <DramaCard key={drama.id} drama={drama} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Not logged in or empty watchlist */}
        {(!user || entries.length === 0) && !loading && (
          <section className="text-center py-16 bg-card rounded-xl border border-border">
            <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display text-foreground mb-2">Get Personalized Picks</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {!user
                ? "Sign in and start tracking dramas to unlock personalized recommendations."
                : "Add some dramas to your watchlist and rate them to see recommendations tailored to you."}
            </p>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Dramas
            </Link>
          </section>
        )}
      </main>
    </div>
  );
};

export default Recommendations;
