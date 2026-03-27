import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import DramaCard from "@/components/DramaCard";
import { dramas, genres, searchDramas } from "@/data/dramas";

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const genreFilter = searchParams.get("genre") || "";
  const filter = searchParams.get("filter") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(genreFilter);

  const filteredDramas = useMemo(() => {
    let results = dramas;

    if (query.trim()) {
      results = searchDramas(query);
    }

    if (selectedGenre) {
      results = results.filter(d => d.genres.includes(selectedGenre));
    }

    if (filter === "top-rated") {
      results = [...results].sort((a, b) => b.rating - a.rating);
    }

    return results;
  }, [query, selectedGenre, filter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-display text-foreground mb-2">
          {filter === "top-rated" ? "Top Rated" : filter === "trending" ? "Trending" : "Browse"} K-Dramas
        </h1>
        <p className="text-muted-foreground mb-8">
          {filteredDramas.length} drama{filteredDramas.length !== 1 ? "s" : ""} found
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, actor, genre..."
              className="w-full bg-card border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !selectedGenre ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All
            </button>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre === selectedGenre ? "" : genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedGenre === genre ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredDramas.map((drama, i) => (
            <DramaCard key={drama.id} drama={drama} index={i} />
          ))}
        </div>

        {filteredDramas.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No dramas found. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
