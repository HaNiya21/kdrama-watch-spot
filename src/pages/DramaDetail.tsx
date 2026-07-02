import { useParams, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Star, Calendar, Tv, PlayCircle, ArrowLeft, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import DramaCard from "@/components/DramaCard";
import DramaFAQ from "@/components/DramaFAQ";
import WatchlistTracker from "@/components/WatchlistTracker";
import AuthModal from "@/components/AuthModal";
import { fetchKDramaDetails, fetchTrendingKDramas } from "@/lib/tmdb";
import { useAggregateRating } from "@/hooks/useAggregateRatings";

const DramaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [authOpen, setAuthOpen] = useState(false);
  const agg = useAggregateRating(id || "");

  const { data: drama, isLoading } = useQuery({
    queryKey: ["tmdb-detail", id],
    queryFn: () => fetchKDramaDetails(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 15,
  });

  // Fetch similar dramas based on similarIds from the detail response
  const { data: similarDramas = [] } = useQuery({
    queryKey: ["tmdb-similar", drama?.similarIds],
    queryFn: async () => {
      if (!drama?.similarIds?.length) return [];
      const promises = drama.similarIds.slice(0, 6).map(sid => fetchKDramaDetails(sid).catch(() => null));
      const results = await Promise.all(promises);
      return results.filter(Boolean) as NonNullable<typeof drama>[];
    },
    enabled: !!drama && drama.similarIds.length > 0,
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Drama not found</p>
          <Link to="/" className="text-primary hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${drama.title} (${drama.year || "K-Drama"}) — Cast, Rating & Where to Watch`}
        description={(drama.synopsis || `Watch ${drama.title}, a Korean drama.`).slice(0, 200)}
        path={`/drama/${drama.id}`}
        type="video.tv_show"
        image={drama.poster}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "TVSeries",
          name: drama.title,
          alternateName: drama.titleKorean || undefined,
          image: drama.poster,
          description: drama.synopsis,
          genre: drama.genres,
          numberOfEpisodes: drama.episodes || undefined,
          datePublished: drama.year ? String(drama.year) : undefined,
          aggregateRating: drama.rating
            ? {
                "@type": "AggregateRating",
                ratingValue: drama.rating,
                bestRating: 10,
                ratingCount: Math.max(agg?.rating_count || 1, 1),
              }
            : undefined,
        }}
      />
      <Navbar />

      <div className="relative h-[50vh] md:h-[60vh]">
        <img src={drama.backdrop} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>

      <main className="container mx-auto px-4 -mt-48 relative z-10 pb-16">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-48 md:w-64 flex-shrink-0">
            <img src={drama.poster} alt={drama.title} className="w-full rounded-xl shadow-[var(--shadow-card)]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
            <h1 className="text-4xl md:text-5xl font-display text-foreground mb-1">{drama.title}</h1>
            {drama.titleKorean && <p className="text-lg text-muted-foreground mb-4">{drama.titleKorean}</p>}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 fill-rating text-rating" />
                <span className="text-lg font-bold text-rating">{drama.rating}</span>
              </div>
              {agg && agg.rating_count > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    <span className="font-semibold text-foreground">{agg.avg_rating}</span>/5 ({agg.rating_count} {agg.rating_count === 1 ? "user" : "users"})
                  </span>
                </div>
              )}
              {drama.year > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" /><span className="text-sm">{drama.year}</span>
                </div>
              )}
              {drama.episodes > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Tv className="w-4 h-4" /><span className="text-sm">{drama.episodes} Episodes</span>
                </div>
              )}
              {drama.network && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <PlayCircle className="w-4 h-4" /><span className="text-sm">{drama.network}</span>
                </div>
              )}
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${drama.airingStatus === "ongoing" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {drama.airingStatus === "ongoing" ? "Currently Airing" : "Completed"}
              </span>
            </div>

            <div className="mb-6">
              <WatchlistTracker dramaId={drama.id} totalEpisodes={drama.episodes} onAuthRequired={() => setAuthOpen(true)} />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {drama.genres.map(g => (
                <Link key={g} to={`/browse?genre=${encodeURIComponent(g)}`} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">{g}</Link>
              ))}
            </div>

            <h2 className="text-xl font-display text-foreground mb-2">Synopsis</h2>
            <p className="text-foreground/80 leading-relaxed mb-8">{drama.synopsis}</p>

            {drama.tags.length > 0 && (
              <>
                <h2 className="text-xl font-display text-foreground mb-3">Tags & Keywords</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  {drama.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">#{tag}</span>
                  ))}
                </div>
              </>
            )}

            {drama.cast.length > 0 && (
              <>
                <h2 className="text-xl font-display text-foreground mb-3">Cast</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {drama.cast.map(member => (
                    <div key={member.name} className="bg-card rounded-lg p-3 border border-border flex items-center gap-3">
                      {member.image && (
                        <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">as {member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {drama.episodes > 0 && (
              <>
                <h2 className="text-xl font-display text-foreground mb-3">Episodes</h2>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-8">
                  {Array.from({ length: drama.episodes }, (_, i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-2 text-center hover:bg-secondary transition-colors cursor-pointer">
                      <span className="text-xs text-muted-foreground">Ep</span>
                      <p className="text-sm font-medium text-foreground">{i + 1}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        <DramaFAQ drama={drama} />

        {similarDramas.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display text-foreground mb-5">Similar Dramas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {similarDramas.map((d, i) => <DramaCard key={d.id} drama={d} index={i} />)}
            </div>
          </section>
        )}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default DramaDetail;
