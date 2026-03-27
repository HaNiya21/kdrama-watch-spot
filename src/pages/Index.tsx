import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DramaRow from "@/components/DramaRow";
import GenreChips from "@/components/GenreChips";
import { dramas } from "@/data/dramas";

const Index = () => {
  const trending = dramas.slice(0, 6);
  const topRated = [...dramas].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const romance = dramas.filter(d => d.genres.includes("Romance")).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <main className="container mx-auto px-4 pb-16">
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
