import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, Star, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { fetchPerson, type PersonCredit } from "@/lib/tmdb";

type Filter = "all" | "tv" | "movie";

const CreditCard = ({ c }: { c: PersonCredit }) => {
  const body = (
    <>
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-card border border-border">
        <img src={c.poster} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="mt-2">
        <p className="text-sm font-medium text-foreground line-clamp-1">{c.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {c.character ? `as ${c.character}` : "\u00a0"}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="uppercase tracking-wide text-primary">{c.mediaType === "tv" ? "Show" : "Movie"}</span>
          {c.year > 0 && <span>{c.year}</span>}
          {c.rating > 0 && (
            <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-primary text-primary" />{c.rating}</span>
          )}
          {c.mediaType === "movie" && <ExternalLink className="w-3 h-3" />}
        </div>
      </div>
    </>
  );
  return c.mediaType === "tv" ? (
    <Link to={`/drama/${c.id}`} className="group block">{body}</Link>
  ) : (
    <a href={`https://www.themoviedb.org/movie/${c.id}`} target="_blank" rel="noopener noreferrer" className="group block">{body}</a>
  );
};

const Person = () => {
  const { id } = useParams<{ id: string }>();
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, error } = useQuery({
    queryKey: ["person", id],
    queryFn: () => fetchPerson(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  });

  const credits = (data?.credits || []).filter(c => filter === "all" || c.mediaType === filter);
  const tvCount = data?.credits.filter(c => c.mediaType === "tv").length || 0;
  const movieCount = data?.credits.filter(c => c.mediaType === "movie").length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {data && (
        <SEO
          title={`${data.name} – Shows & Movies`}
          description={`All TV shows and movies featuring ${data.name}.`}
          path={`/person/${id}`}
        />
      )}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <button onClick={() => history.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {isLoading && (
          <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        )}
        {error && <p className="text-muted-foreground">Couldn't load this actor. Please try again.</p>}

        {data && (
          <>
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              {data.photo && (
                <img src={data.photo} alt={data.name} className="w-40 h-56 object-cover rounded-xl border border-border" />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-display text-foreground mb-2">{data.name}</h1>
                <p className="text-sm text-muted-foreground mb-4">
                  {data.knownFor}{data.birthday ? ` · Born ${data.birthday}` : ""} · {tvCount} shows · {movieCount} movies
                </p>
                {data.biography && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6 max-w-3xl">{data.biography}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              {([["all", "All"], ["tv", "Shows"], ["movie", "Movies"]] as [Filter, string][]).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    filter === k ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {credits.length === 0 ? (
              <p className="text-muted-foreground">Nothing found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {credits.map(c => <CreditCard key={`${c.mediaType}-${c.id}`} c={c} />)}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Person;
