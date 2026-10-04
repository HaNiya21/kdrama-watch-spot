import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";

export type FollowKind = "person" | "network";

export interface FollowRow {
  id: string;
  kind: FollowKind;
  target_id: string;
  name: string;
  image: string | null;
  created_at: string;
}

export const useFollows = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["follows", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("follows")
        .select("id, kind, target_id, name, image, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as FollowRow[];
    },
  });
};

interface Props {
  kind: FollowKind;
  targetId: string;
  name: string;
  image?: string;
}

const FollowButton = ({ kind, targetId, name, image }: Props) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: follows } = useFollows();
  const [busy, setBusy] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const existing = follows?.find(f => f.kind === kind && f.target_id === targetId);

  const toggle = async () => {
    if (!user) return setAuthOpen(true);
    setBusy(true);
    const table = (supabase as any).from("follows");
    const { error } = existing
      ? await table.delete().eq("id", existing.id)
      : await table.insert({ user_id: user.id, kind, target_id: targetId, name, image: image || null });
    if (error) console.error(error);
    await qc.invalidateQueries({ queryKey: ["follows"] });
    setBusy(false);
  };

  return (
    <>
      <button
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm border transition-colors ${
          existing ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary"
        }`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={`w-4 h-4 ${existing ? "fill-current" : ""}`} />}
        {existing ? "Following" : "Follow"}
      </button>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default FollowButton;
