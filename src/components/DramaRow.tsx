import type { Drama } from "@/data/dramas";
import DramaCard from "./DramaCard";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DramaRowProps {
  title: string;
  dramas: Drama[];
  linkTo?: string;
}

const DramaRow = ({ title, dramas, linkTo }: DramaRowProps) => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-display text-foreground">{title}</h2>
        {linkTo && (
          <Link
            to={linkTo}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dramas.map((drama, i) => (
          <DramaCard key={drama.id} drama={drama} index={i} />
        ))}
      </div>
    </section>
  );
};

export default DramaRow;
