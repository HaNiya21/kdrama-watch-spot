import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-display text-gradient">KDramaDex</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/browse" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Browse
          </Link>
          <Link to="/browse?filter=trending" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
            Trending
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="overflow-hidden"
              >
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dramas..."
                  className="w-full bg-secondary text-foreground text-sm px-4 py-2 rounded-lg outline-none placeholder:text-muted-foreground"
                />
              </motion.form>
            )}
          </AnimatePresence>

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass border-t border-border"
          >
            <div className="flex flex-col p-4 gap-3">
              <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">Home</Link>
              <Link to="/browse" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">Browse</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
