import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import DramaCard from "@/components/DramaCard";
import { fetchNetflixKDramas } from "@/lib/tmdb";

const TITLE = "Best Korean Dramas on Netflix (2026) — KDramaDex";
const DESCRIPTION =
  "The best Korean dramas streaming on Netflix right now — a curated, ratings-driven guide covering romance, thriller, historical, and fantasy K-dramas Netflix subscribers can watch tonight.";

const FAQS = [
  {
    q: "What are the best Korean dramas on Netflix in 2026?",
    a: "The top-rated Korean dramas on Netflix span every genre — from the survival thriller Squid Game and the romance Crash Landing on You to the fantasy Goblin and the mystery Signal. This guide surfaces the highest-rated K-dramas currently available on Netflix so you can pick one that matches your mood.",
  },
  {
    q: "Are all Korean dramas on Netflix worldwide?",
    a: "No — Netflix's K-drama library varies by region because of licensing. The list on this page reflects titles available on Netflix US; some may also stream on Netflix in the UK, Canada, Australia, and other markets, but availability can change month to month.",
  },
  {
    q: "How do I find new Korean dramas on Netflix?",
    a: "Netflix adds new K-dramas most weeks, especially Netflix Originals produced in Korea. Sort this guide by rating to find hidden gems, or bookmark titles to your KDramaDex watchlist so you can track episode-by-episode progress once you start watching.",
  },
  {
    q: "What genre of K-drama should I start with on Netflix?",
    a: "If you're new to K-dramas, romance and thriller are the easiest entry points. Try Crash Landing on You or Business Proposal for romance, Squid Game or Kingdom for thriller, and Extraordinary Attorney Woo for a lighter, feel-good watch.",
  },
];

const NetflixGuide = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["netflix-kdramas"],
    queryFn: () => fetchNetflixKDramas(1, "vote_average.desc"),
    staleTime: 1000 * 60 * 30,
  });

  const { data: popular } = useQuery({
    queryKey: ["netflix-kdramas-popular"],
    queryFn: () => fetchNetflixKDramas(1, "popularity.desc"),
    staleTime: 1000 * 60 * 30,
  });


  const topRated = (data?.dramas || []).filter((d) => d.rating >= 7).slice(0, 24);
  const trending = (popular?.dramas || []).slice(0, 12);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Korean Dramas on Netflix",
    itemListElement: topRated.slice(0, 10).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.title,
      url: `https://kdrama-watch-spot.lovable.app/drama/${d.id}`,
    })),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={TITLE}
        description={DESCRIPTION}
        path="/best-korean-dramas-on-netflix"
        jsonLd={[itemListLd, faqLd]}
      />
      <Navbar />


      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link to="/browse" className="hover:text-foreground">Browse</Link></li>
            <li aria-hidden>/</li>
            <li className="text-foreground" aria-current="page">Best K-Dramas on Netflix</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Play className="w-3.5 h-3.5 fill-primary" /> Netflix Guide · Updated 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground mb-4 leading-tight">
            The Best Korean Dramas on Netflix Right Now
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            A curated guide to the highest-rated Korean dramas streaming on Netflix. Every title
            below is ranked by community score and confirmed available on Netflix — no dead links,
            no "coming soon", just K-dramas you can start tonight.
          </p>
        </header>

        {/* Intro */}
        <section className="prose prose-invert max-w-none mb-12 text-foreground/80 leading-relaxed space-y-4">
          <p>
            Netflix has become one of the largest homes for Korean dramas outside of Korea, from
            homegrown Netflix Originals like <em>Squid Game</em> and <em>Kingdom</em> to global
            romance hits like <em>Crash Landing on You</em> and <em>Business Proposal</em>. But
            with hundreds of K-dramas in the catalog, finding the right one to watch next is
            harder than it looks.
          </p>
          <p>
            This guide surfaces the best Korean dramas available on Netflix — ranked by rating,
            grouped by mood, and updated as the catalog changes. Save any title to your{" "}
            <Link to="/watchlist" className="text-primary hover:underline">watchlist</Link> to
            track episode progress, or head to <Link to="/recommendations" className="text-primary hover:underline">For You</Link>{" "}
            for picks based on what you've already rated.
          </p>
        </section>

        {/* Top rated */}
        <section className="mb-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-display text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Top-Rated K-Dramas on Netflix
            </h2>
            <span className="text-xs text-muted-foreground">Ranked by community score</span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-12">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading Netflix catalog…
            </div>
          ) : isError ? (
            <div className="py-12 text-center">
              <p className="text-destructive mb-3">Couldn't load Netflix K-dramas.</p>
              <button
                onClick={() => refetch()}
                className="text-primary hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : topRated.length === 0 ? (
            <p className="text-muted-foreground py-8">No titles found for this region right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topRated.map((drama, i) => (
                <DramaCard key={drama.id} drama={drama} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Trending on Netflix */}
        {trending.length > 0 && (
          <section className="mb-14">
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl font-display text-foreground">Trending on Netflix This Week</h2>
              <span className="text-xs text-muted-foreground">Sorted by popularity</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending.map((drama, i) => (
                <DramaCard key={drama.id} drama={drama} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Why Netflix section */}
        <section className="mb-14 bg-card border border-border rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-display text-foreground mb-4">
            Why Watch Korean Dramas on Netflix?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground leading-relaxed">
            <div>
              <h3 className="text-foreground font-medium mb-2">Subtitles &amp; Dubs</h3>
              <p>
                Nearly every K-drama on Netflix ships with high-quality English subtitles, and many
                originals include full English dubs — a big advantage over other streaming services.
              </p>
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-2">Netflix Originals</h3>
              <p>
                Netflix funds original K-dramas that never air on Korean broadcast TV, including
                Squid Game, Kingdom, All of Us Are Dead, and The Glory — many of which become
                global phenomena.
              </p>
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-2">Full Seasons on Release</h3>
              <p>
                Unlike weekly Korean broadcasts, Netflix drops most K-drama seasons all at once, so
                you can binge instead of waiting week to week.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-2xl font-display text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="bg-card border border-border rounded-lg p-5 group"
              >
                <summary className="cursor-pointer text-foreground font-medium list-none flex items-start justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-10 border-t border-border">
          <h2 className="text-xl font-display text-foreground mb-2">Track what you watch</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Save any K-drama to your watchlist and pick up right where you left off.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Browse all K-dramas
          </Link>
        </section>
      </main>
    </div>
  );
};

export default NetflixGuide;
