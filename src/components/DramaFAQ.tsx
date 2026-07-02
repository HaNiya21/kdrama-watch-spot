import { useEffect } from "react";
import type { Drama } from "@/data/dramas";

interface Props {
  drama: Drama;
}

function buildFaqs(drama: Drama): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const title = drama.title;

  // Where to watch
  if (drama.network) {
    faqs.push({
      q: `Where can I watch ${title}?`,
      a: `${title} originally aired on ${drama.network}. Availability on streaming services like Netflix, Viki, or Disney+ varies by region — check your local listings for the most up-to-date options.`,
    });
  } else {
    faqs.push({
      q: `Where can I watch ${title}?`,
      a: `${title} is a Korean drama. Availability on streaming services like Netflix, Viki, or Disney+ varies by region — check your local listings.`,
    });
  }

  // Release / year
  if (drama.year > 0) {
    faqs.push({
      q: `When did ${title} come out?`,
      a: `${title} first aired in ${drama.year}.`,
    });
  }

  // Episode count
  if (drama.episodes > 0) {
    faqs.push({
      q: `How many episodes does ${title} have?`,
      a: `${title} has ${drama.episodes} episode${drama.episodes === 1 ? "" : "s"}.`,
    });
  }

  // Status
  faqs.push({
    q: `Is ${title} still airing?`,
    a: drama.airingStatus === "ongoing"
      ? `Yes, ${title} is currently airing new episodes.`
      : `No, ${title} has finished airing and all episodes are available.`,
  });

  // What is it about
  if (drama.synopsis && drama.synopsis !== "No synopsis available.") {
    faqs.push({
      q: `What is ${title} about?`,
      a: drama.synopsis,
    });
  }

  // Cast
  if (drama.cast && drama.cast.length > 0) {
    const leads = drama.cast.slice(0, 4).map(c => c.name).join(", ");
    faqs.push({
      q: `Who is in the cast of ${title}?`,
      a: `${title} stars ${leads}${drama.cast.length > 4 ? ", and others" : ""}.`,
    });
  }

  // Genre
  if (drama.genres && drama.genres.length > 0) {
    faqs.push({
      q: `What genre is ${title}?`,
      a: `${title} is a ${drama.genres.join(", ").toLowerCase()} Korean drama${drama.year > 0 ? ` from ${drama.year}` : ""}.`,
    });
  }

  return faqs;
}

const DramaFAQ = ({ drama }: Props) => {
  const faqs = buildFaqs(drama);

  useEffect(() => {
    if (faqs.length === 0) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-drama-faq", drama.id);
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drama.id]);

  if (faqs.length === 0) return null;

  return (
    <section className="mt-8" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-2xl font-display text-foreground mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group bg-card border border-border rounded-lg p-4 open:shadow-[var(--shadow-card)] transition-shadow"
          >
            <summary className="cursor-pointer font-medium text-foreground list-none flex items-center justify-between gap-4">
              <span>{f.q}</span>
              <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default DramaFAQ;
