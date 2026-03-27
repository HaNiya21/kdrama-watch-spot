import { Link } from "react-router-dom";
import { genres } from "@/data/dramas";
import { motion } from "framer-motion";

const GenreChips = () => {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-display text-foreground mb-5">Browse by Genre</h2>
      <div className="flex flex-wrap gap-3">
        {genres.map((genre, i) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              to={`/browse?genre=${encodeURIComponent(genre)}`}
              className="inline-block px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {genre}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GenreChips;
