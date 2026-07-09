import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AggregateRating {
  drama_id: string;
  avg_rating: number;
  rating_count: number;
}

let cache: Record<string, AggregateRating> | null = null;
let fetchPromise: Promise<void> | null = null;

async function fetchAll() {
  const { data } = await supabase.from("drama_aggregate_ratings").select("*");
  if (data) {
    cache = {};
    for (const row of data as AggregateRating[]) {
      cache[row.drama_id] = row;
    }
  }
}

export function useAggregateRatings() {
  const [ratings, setRatings] = useState<Record<string, AggregateRating>>(cache || {});

  useEffect(() => {
    if (cache) {
      setRatings(cache);
      return;
    }
    if (!fetchPromise) {
      fetchPromise = fetchAll();
    }
    fetchPromise.then(() => {
      setRatings(cache || {});
    });
  }, []);

  return ratings;
}

export function useAggregateRating(dramaId: string) {
  const ratings = useAggregateRatings();
  return ratings[dramaId] || null;
}

export function invalidateAggregateCache() {
  cache = null;
  fetchPromise = null;
}
