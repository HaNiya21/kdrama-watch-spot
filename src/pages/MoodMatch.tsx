import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Loader2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface Pick { id: number; title: string; year: string; rating: number; poster: string | null; genres: string[]; reason: string }

const EXAMPLES = [
  "Cozy slow-burn romance in a small seaside town",
  "Dark revenge thriller with a morally grey lead",
  "Something with Lee Jong-suk, enemies to lovers",
  "Funny office drama that makes me cry by the end",
];

const MoodMatch = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [picks, setPicks] = useState<Pick[]>([]);

  const run = async (text = prompt) => {
    if (text.trim().length < 3 || loading) return;
    setPrompt(text);
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("mood-match", { body: { prompt: text } });
    setLoading(false);
    let errMsg = data?.error as string | undefined;
    if (error && !errMsg) {
      try { errMsg = (await (error as any).context?.json())?.error; } catch { /* ignore */ }
      errMsg ||= "Couldn't get recommendations. Please try again.";
    }
    if (errMsg) { setError(errMsg); return; }
    setSummary(data.summary);
    setPicks(data.picks ?? []);
    if (!data.picks?.length) setError("No matches found — try describing it differently.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
            <Sparkles className="w-4 h-4" /> AI-powered Mood Match
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">What are you in the mood for?</h1>
          <p className="text-muted-foreground">Describe a vibe, tropes, or actors — we'll find K-dramas that fit.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); run(); }} className="bg-card border border-border rounded-xl p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={600}
            rows={3}
            aria-label="Describe what you want to watch"
            placeholder="e.g. a healing slice-of-life drama with found family and a grumpy-sunshine couple"
            className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button type="button" key={ex} onClick={() => run(ex)} disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors">
                  {ex}
                </button>
              ))}
            </div>
            <button type="submit" disabled={loading || prompt.trim().length < 3}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Finding matches..." : "Find dramas"}
            </button>
          </div>
        </form>

        {error && <p className="mt-6 text-center text-destructive">{error}</p>}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />)}
          </div>
        )}

        {!loading && picks.length > 0 && (
          <section className="mt-8">
            {summary && <p className="text-muted-foreground mb-4 italic">{summary}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {picks.map((p) => (
                <Link key={p.id} to={`/drama/${p.id}`} className="flex gap-4 bg-card border border-border rounded-xl p-3 hover:border-primary/60 transition-colors">
                  {p.poster ? (
                    <img src={p.poster} alt={`${p.title} poster`} className="w-24 h-36 object-cover rounded-md flex-shrink-0" loading="lazy" />
                  ) : <div className="w-24 h-36 rounded-md bg-secondary flex-shrink-0" />}
                  <div className="min-w-0">
                    <h2 className="font-display text-lg text-foreground leading-tight">{p.title}</h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {p.year && <span>{p.year}</span>}
                      <span className="inline-flex items-center gap-0.5"><Star className="w-3 h-3 text-primary fill-primary" />{p.rating?.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{p.genres.slice(0, 3).join(" · ")}</p>
                    <p className="text-sm text-foreground/80 mt-2">{p.reason}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MoodMatch;
