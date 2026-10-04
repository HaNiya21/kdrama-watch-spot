import { Link } from "react-router-dom";
import { User, Tv } from "lucide-react";
import { useFollows } from "@/components/FollowButton";

const FollowingList = () => {
  const { data, isLoading } = useFollows();
  if (isLoading) return null;
  const groups = [
    { kind: "person", label: "Favorite Actors", base: "/person", Icon: User },
    { kind: "network", label: "Favorite Channels", base: "/network", Icon: Tv },
  ] as const;

  return (
    <section className="bg-card border border-border rounded-xl p-6 mt-6">
      <h2 className="text-xl font-display text-foreground mb-4">Following</h2>
      {groups.map(g => {
        const items = (data || []).filter(f => f.kind === g.kind);
        return (
          <div key={g.kind} className="mb-5 last:mb-0">
            <h3 className="text-sm text-muted-foreground mb-2">{g.label}</h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet — tap Follow on a {g.kind === "person" ? "actor" : "channel"} page.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map(f => (
                  <Link key={f.id} to={`${g.base}/${f.target_id}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:border-primary text-sm text-foreground">
                    {f.image ? <img src={f.image} alt={f.name} className="w-6 h-6 rounded-full object-cover" /> : <g.Icon className="w-4 h-4" />}
                    {f.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default FollowingList;
