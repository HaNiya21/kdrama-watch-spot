import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Mail, User as UserIcon, Loader2, Pencil, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import WatchlistSummary from "@/components/WatchlistSummary";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProfileRow {
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function timeAgo(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        if (error) toast({ title: "Couldn't load profile", description: error.message, variant: "destructive" });
        setProfile(data as ProfileRow | null);
        setNameDraft(data?.display_name || "");
        setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      toast({ title: "Display name can't be empty", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setProfile((p) => (p ? { ...p, display_name: trimmed, updated_at: new Date().toISOString() } : p));
    setEditing(false);
    toast({ title: "Profile updated" });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const signupTime = user.created_at;
  const lastSignIn = user.last_sign_in_at;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-display text-foreground mb-2">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Account details and activity</p>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-display flex-shrink-0">
                {(profile?.display_name || user.email || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      className="flex-1 min-w-0 bg-secondary text-foreground px-3 py-2 rounded-lg outline-none text-lg font-medium"
                      autoFocus
                      maxLength={50}
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      aria-label="Save"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setNameDraft(profile?.display_name || ""); }}
                      className="p-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80"
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-display text-foreground truncate">
                      {profileLoading ? "…" : profile?.display_name || "Unnamed"}
                    </h2>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      aria-label="Edit display name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            <dl className="space-y-5">
              <Row icon={<Mail className="w-4 h-4" />} label="Email">
                {user.email}
                {user.email_confirmed_at && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">Verified</span>
                )}
              </Row>
              <Row icon={<UserIcon className="w-4 h-4" />} label="User ID">
                <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">{user.id}</code>
              </Row>
              <Row icon={<Calendar className="w-4 h-4" />} label="Account created">
                {formatDate(signupTime)}
                <span className="ml-2 text-xs text-muted-foreground">({timeAgo(signupTime)})</span>
              </Row>
              <Row icon={<Clock className="w-4 h-4" />} label="Last sign-in">
                {formatDate(lastSignIn)}
                <span className="ml-2 text-xs text-muted-foreground">({timeAgo(lastSignIn)})</span>
              </Row>
              <Row icon={<Clock className="w-4 h-4" />} label="Current session">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Active now
                </span>
              </Row>
            </dl>
          </div>

          <section className="mt-8 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-display text-foreground mb-1">Watchlist</h2>
            <p className="text-sm text-muted-foreground mb-6">Your tracking activity at a glance</p>
            <WatchlistSummary />
          </section>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/watchlist"
              className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              My Watchlist
            </Link>
            <Link
              to="/recommendations"
              className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              For You
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

const Row = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
    <dt className="flex items-center gap-2 text-sm text-muted-foreground sm:w-40 flex-shrink-0">
      {icon}
      {label}
    </dt>
    <dd className="text-sm text-foreground flex-1 flex flex-wrap items-center">{children}</dd>
  </div>
);

export default Profile;
