import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-display text-foreground mb-4">
            Your <span className="text-gradient">K-Drama</span> Universe
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover, track, and get personalized recommendations for your favorite Korean dramas.
          </p>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dramas, actors, genres..."
                aria-label="Search dramas, actors, and genres"
                className="w-full bg-card/80 backdrop-blur-xl border border-border text-foreground pl-12 pr-4 py-4 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground transition-all"
              />
            </div>
          </form>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Explore Dramas
            </Link>
            <Link
              to="/browse?filter=top-rated"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Top Rated
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
