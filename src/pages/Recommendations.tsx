import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Sparkles, Compass, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import DramaCard from "@/components/DramaCard";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWatchlist } from "@/lib/watchlist";
import {
  getRecommendations,
  getBecauseYouWatched,
  getDramasByMood,
  moodLabels,
  type Mood,
} from "@/lib/recommendations";
import { useState } from "react";

const moods: Mood[] = ["romantic", "thrilling", "funny", "emotional", "action-packed"];

const Recommendations = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: getUserWatchlist,
    enabled: !!user,
  });

  const watchedIds = new Set(entries.map(e => e.drama_id));

  const { data: personalized = [], isLoading: recLoading } = useQuery({
    queryKey: ["recommendations", entries.map(e => e.drama_id).sort().join(",")],
    queryFn: () => getRecommendations(entries),
    enabled: !!user && entries.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  const { data: becauseYouWatched = [] } = useQuery({
    queryKey: ["because-you-watched", entries.map(e => e.drama_id).sort().join(",")],
    queryFn: () => getBecauseYouWatched(entries),
    enabled: !!user && entries.length > 0,
    staleTime: 1000 * 60 * 10,
  });

  const { data: moodDramas = [], isLoading: moodLoading } = useQuery({
    queryKey: ["mood-dramas", selectedMood],
    queryFn: () => getDramasByMood(selectedMood!, watchedIds),
    enabled: !!selectedMood,
    staleTime: 1000 * 60 * 5,
  });

  const loading = entriesLoading || recLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="K-Drama Recommendations For You — KDramaDex"
        description="Personalized Korean drama recommendations based on your watchlist and ratings. Discover your next favorite K-drama."
        path="/recommendations"
      />
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
          {selectedMood && moodLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {selectedMood && !moodLoading && moodDramas.length > 0 && (
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

        {user && loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {(!user || (entries.length === 0 && !entriesLoading)) && (
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
