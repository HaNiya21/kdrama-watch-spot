import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User, LogOut, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-display text-gradient">KDramaDex</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Home</Link>
            <Link to="/browse" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Browse</Link>
            {user && (
              <Link to="/watchlist" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1">
                <BookmarkCheck className="w-4 h-4" /> My List
              </Link>
            )}
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

            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-[var(--shadow-card)] overflow-hidden min-w-[180px] z-50"
                    >
                      <p className="px-4 py-2 text-xs text-muted-foreground truncate border-b border-border">{user.email}</p>
                      <Link to="/watchlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                        <BookmarkCheck className="w-4 h-4" /> My Watchlist
                      </Link>
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <User className="w-4 h-4" /> Sign In
              </button>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden glass border-t border-border">
              <div className="flex flex-col p-4 gap-3">
                <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">Home</Link>
                <Link to="/browse" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">Browse</Link>
                {user && <Link to="/watchlist" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-foreground/70 hover:text-foreground py-2">My Watchlist</Link>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Navbar;
