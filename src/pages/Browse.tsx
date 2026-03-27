import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import DramaCard from "@/components/DramaCard";
import { discoverKDramas, searchKDramas, fetchTopRatedKDramas } from "@/lib/tmdb";

const GENRE_OPTIONS = [
  { id: "", label: "All" },
  { id: "18", label: "Drama" },
  { id: "35", label: "Comedy" },
  { id: "10749", label: "Romance" },
  { id: "10759", label: "Action" },
  { id: "10765", label: "Sci-Fi & Fantasy" },
  { id: "9648", label: "Mystery" },
  { id: "80", label: "Crime" },
  { id: "10768", label: "War & Politics" },
  { id: "10751", label: "Family" },
];

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const genreFilter = searchParams.get("genre") || "";
  const filter = searchParams.get("filter") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(genreFilter);
  const [page, setPage] = useState(1);

  // Search mode
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["tmdb-search", query],
    queryFn: () => searchKDramas(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Top rated mode
  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ["tmdb-top-rated-browse"],
    queryFn: fetchTopRatedKDramas,
    enabled: filter === "top-rated" && !query.trim(),
    staleTime: 1000 * 60 * 10,
  });

  // Discover mode (default)
  const { data: discoverData, isLoading: discoverLoading } = useQuery({
    queryKey: ["tmdb-discover", page, selectedGenre, filter],
    queryFn: () => discoverKDramas(page, selectedGenre || undefined, filter === "trending" ? "popularity.desc" : undefined),
    enabled: !query.trim() && filter !== "top-rated",
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = searchLoading || topRatedLoading || discoverLoading;

  let dramas = discoverData?.dramas || [];
  const totalPages = discoverData?.totalPages || 1;

  if (query.trim() && searchResults) {
    dramas = searchResults;
  } else if (filter === "top-rated" && topRated) {
    dramas = topRated;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-display text-foreground mb-2">
          {filter === "top-rated" ? "Top Rated" : filter === "trending" ? "Trending" : "Browse"} K-Dramas
        </h1>
        <p className="text-muted-foreground mb-8">
          {dramas.length} drama{dramas.length !== 1 ? "s" : ""} found
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by title..."
              className="w-full bg-card border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map(g => (
              <button
                key={g.id}
                onClick={() => { setSelectedGenre(g.id === selectedGenre ? "" : g.id); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedGenre === g.id || (!selectedGenre && !g.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {dramas.map((drama, i) => (
                <DramaCard key={drama.id} drama={drama} index={i} />
              ))}
            </div>

            {dramas.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No dramas found. Try a different search.</p>
              </div>
            )}

            {/* Pagination */}
            {!query.trim() && filter !== "top-rated" && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-40 hover:bg-secondary/80 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium disabled:opacity-40 hover:bg-secondary/80 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Browse;
