import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Drama } from "@/data/dramas";

interface DramaCardProps {
  drama: Drama;
  index?: number;
}

const DramaCard = ({ drama, index = 0 }: DramaCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/drama/${drama.id}`} className="group block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden card-hover">
          <img
            src={drama.poster}
            alt={drama.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3.5 h-3.5 fill-rating text-rating" />
              <span className="text-xs font-medium text-rating">{drama.rating}</span>
            </div>
            <p className="text-xs text-foreground/70 line-clamp-2">{drama.synopsis}</p>
          </div>
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/80 text-primary-foreground backdrop-blur-sm">
              {drama.airingStatus === "ongoing" ? "Airing" : drama.year}
            </span>
          </div>
        </div>
        <div className="mt-2 px-1">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {drama.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{drama.genres.slice(0, 2).join(" · ")}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default DramaCard;
