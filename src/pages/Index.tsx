import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DramaRow from "@/components/DramaRow";
import DramaCard from "@/components/DramaCard";
import GenreChips from "@/components/GenreChips";
import { dramas } from "@/data/dramas";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWatchlist, type WatchlistEntry } from "@/lib/watchlist";
import { getRecommendations } from "@/lib/recommendations";

const Index = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);

  useEffect(() => {
    if (user) getUserWatchlist().then(setEntries);
  }, [user]);

  const trending = dramas.slice(0, 6);
  const topRated = [...dramas].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const romance = dramas.filter(d => d.genres.includes("Romance")).slice(0, 6);
  const recommendations = getRecommendations(entries).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 pb-16">
        {/* Personalized recommendations if logged in */}
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

        <DramaRow title="🔥 Trending Now" dramas={trending} linkTo="/browse?filter=trending" />
        <DramaRow title="⭐ Top Rated" dramas={topRated} linkTo="/browse?filter=top-rated" />
        <GenreChips />
        <DramaRow title="💕 Romance Picks" dramas={romance} linkTo="/browse?genre=Romance" />
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
