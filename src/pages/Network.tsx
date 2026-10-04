import { useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import DramaCard from "@/components/DramaCard";
import { fetchNetwork, fetchNetworkShows } from "@/lib/tmdb";

type Mode = "now" | "history";

const Network = () => {
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<Mode>("now");
  const sentinel = useRef<HTMLDivElement>(null);

  const { data: network } = useQuery({
    queryKey: ["network", id],
    queryFn: () => fetchNetwork(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });

  const shows = useInfiniteQuery({
    queryKey: ["network-shows", id, mode],
    queryFn: ({ pageParam }) => fetchNetworkShows(id!, mode, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, all) => (all.length < last.totalPages ? all.length + 1 : undefined),
    enabled: !!id,
  });

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && shows.hasNextPage && !shows.isFetchingNextPage) shows.fetchNextPage();
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [shows]);

  const dramas = shows.data?.pages.flatMap(p => p.dramas) || [];
  const name = network?.name || "Channel";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SEO title={`${name} K-Dramas – On Air & History`} description={`K-dramas airing now on ${name} and its full drama history.`} path={`/network/${id}`} />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <button onClick={() => history.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-5 mb-8">
          {network?.logo && (
            <div className="bg-foreground/90 rounded-lg p-3">
              <img src={network.logo} alt={name} className="h-10 w-auto object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-display text-foreground">{name}</h1>
            {network?.country && <p className="text-sm text-muted-foreground">{network.country}</p>}
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {([["now", "On Air Now"], ["history", "History"]] as [Mode, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                mode === k ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {shows.isLoading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : shows.error ? (
          <p className="text-muted-foreground">Couldn't load shows. Please try again.</p>
        ) : dramas.length === 0 ? (
          <p className="text-muted-foreground">{mode === "now" ? "Nothing is airing on this channel right now." : "No shows found."}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {dramas.map((d, i) => <DramaCard key={`${d.id}-${i}`} drama={d} index={i % 20} />)}
          </div>
        )}
        <div ref={sentinel} className="h-10" />
        {shows.isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />}
      </main>
    </div>
  );
};

export default Network;
