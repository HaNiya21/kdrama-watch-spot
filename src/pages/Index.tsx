import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DramaRow from "@/components/DramaRow";
import DramaCard from "@/components/DramaCard";
import GenreChips from "@/components/GenreChips";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWatchlist, type WatchlistEntry } from "@/lib/watchlist";
import { getRecommendations } from "@/lib/recommendations";
import { fetchTrendingKDramas, fetchTopRatedKDramas, fetchKDramasByGenre } from "@/lib/tmdb";

const Index = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);

  useEffect(() => {
    if (user) getUserWatchlist().then(setEntries);
  }, [user]);

  const { data: trending = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["tmdb-trending"],
    queryFn: fetchTrendingKDramas,
    staleTime: 1000 * 60 * 10,
  });

  const { data: topRated = [], isLoading: topRatedLoading } = useQuery({
    queryKey: ["tmdb-top-rated"],
    queryFn: fetchTopRatedKDramas,
    staleTime: 1000 * 60 * 10,
  });

  const { data: romance = [], isLoading: romanceLoading } = useQuery({
    queryKey: ["tmdb-romance"],
    queryFn: () => fetchKDramasByGenre("10749"),
    staleTime: 1000 * 60 * 10,
  });

  const recommendations = getRecommendations(entries).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 pb-16">
        {user && recommendations.length > 0 && (
          <section className="py-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-display text-foreground">Picked for You</h2>
              </div>
              <Link to="/recommendations" className="text-sm text-primary hover:text-primary/80 transition-colors">
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommendations.map(({ drama, reasons }, i) => (
                <div key={drama.id}>
                  <DramaCard drama={drama} index={i} />
                  {reasons[0] && (
                    <p className="text-[11px] text-primary/80 mt-1 px-1 line-clamp-2">{reasons[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {trendingLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <DramaRow title="🔥 Trending Now" dramas={trending.slice(0, 6)} linkTo="/browse?filter=trending" />
        )}

        {topRatedLoading ? null : (
          <DramaRow title="⭐ Top Rated" dramas={topRated.slice(0, 6)} linkTo="/browse?filter=top-rated" />
        )}

        <GenreChips />

        {romanceLoading ? null : (
          <DramaRow title="💕 Romance Picks" dramas={romance.slice(0, 6)} linkTo="/browse?genre=10749" />
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <span className="text-2xl font-display text-gradient">KDramaDex</span>
          <p className="text-sm text-muted-foreground mt-2">Your K-Drama Universe · Discover · Track · Enjoy</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
