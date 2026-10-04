import { useSearchParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, User, Tv } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import DramaCard from "@/components/DramaCard";
import { discoverKDramas, searchKDramas, searchPeople, searchNetworks, fetchTopRatedKDramas } from "@/lib/tmdb";

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
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Search mode
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["tmdb-search", query],
    queryFn: () => searchKDramas(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // People (actor) search
  const { data: peopleResults } = useQuery({
    queryKey: ["tmdb-search-people", query],
    queryFn: () => searchPeople(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Channel search (client-side match on known K-drama networks)
  const networkResults = searchNetworks(query);

  // Top rated mode
  const { data: topRated, isLoading: topRatedLoading } = useQuery({
    queryKey: ["tmdb-top-rated-browse"],
    queryFn: fetchTopRatedKDramas,
    enabled: filter === "top-rated" && !query.trim(),
    staleTime: 1000 * 60 * 10,
  });

  // Infinite discover mode
  const {
    data: discoverData,
    isLoading: discoverLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["tmdb-discover-infinite", selectedGenre, filter],
    queryFn: ({ pageParam = 1 }) =>
      discoverKDramas(pageParam, selectedGenre || undefined, filter === "trending" ? "popularity.desc" : undefined),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled: !query.trim() && filter !== "top-rated",
    staleTime: 1000 * 60 * 5,
  });

  // Intersection observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { rootMargin: "400px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const isLoading = searchLoading || topRatedLoading || discoverLoading;

  // Flatten infinite pages
  const discoverDramas = discoverData?.pages.flatMap(p => p.dramas) || [];

  let dramas = discoverDramas;
  if (query.trim() && searchResults) {
    dramas = searchResults;
  } else if (filter === "top-rated" && topRated) {
    dramas = topRated;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={query ? `Search: ${query} — KDramaDex` : "Browse Korean Dramas — KDramaDex"}
        description="Browse the full catalog of Korean dramas by genre, popularity, or top ratings. Search romance, thriller, historical, and fantasy K-dramas."
        path="/browse"
      />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-display text-foreground mb-2">
          {filter === "top-rated" ? "Top Rated" : filter === "trending" ? "Trending" : "Browse"} K-Dramas
        </h1>
        <p className="text-muted-foreground mb-8">
          {dramas.length} drama{dramas.length !== 1 ? "s" : ""} loaded
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shows, actors, channels..."
              className="w-full bg-card border border-border text-foreground pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id === selectedGenre ? "" : g.id)}
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
            {/* Channel matches */}
            {query.trim() && networkResults.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-display text-foreground mb-3 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-primary" /> Channels
                </h2>
                <div className="flex flex-wrap gap-2">
                  {networkResults.map(n => (
                    <Link
                      key={n.id}
                      to={`/network/${n.id}`}
                      className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-medium hover:border-primary/60 transition-colors"
                    >
                      {n.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Actor matches */}
            {query.trim() && peopleResults && peopleResults.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-display text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Actors & People
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {peopleResults.map(p => (
                    <Link
                      key={p.id}
                      to={`/person/${p.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/60 transition-colors"
                    >
                      {p.photo ? (
                        <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.knownFor}{p.knownForTitles.length > 0 ? ` · ${p.knownForTitles.join(", ")}` : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {dramas.map((drama, i) => (
                <DramaCard key={`${drama.id}-${i}`} drama={drama} index={i < 20 ? i : 0} />
              ))}
            </div>

            {dramas.length === 0 && networkResults.length === 0 && (!peopleResults || peopleResults.length === 0) && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No results found. Try a different search.</p>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-1" />

            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}

            {!hasNextPage && dramas.length > 0 && !query.trim() && filter !== "top-rated" && (
              <p className="text-center text-sm text-muted-foreground py-8">You've reached the end!</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Browse;
