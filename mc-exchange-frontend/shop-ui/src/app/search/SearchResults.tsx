"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from '@/lib/supabase';
import EventsList from "@/components/user/EventList";
import { ShopEvent } from "@/types/shop";

export default function SearchResultsContent() {
  const [results, setResults] = useState<ShopEvent[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
<<<<<<< Updated upstream
=======
  const region = searchParams.get("region") || "";
>>>>>>> Stashed changes
  const supabase = useMemo(() => supabaseBrowser(), []);

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
<<<<<<< Updated upstream
      const res = await fetch(`/api/admin/exchanges?search_output=${encodeURIComponent(query)}`, { headers });
      const json = await res.json();
      setResults(json.data || []);
=======

      if (region !== "") {
        const res = await fetch(`/api/user/exchanges?search_output=${encodeURIComponent(query)}&region=${region}`, { headers });
        const json = await res.json();
        setResults(json.data || []);
      }
      else {
        const res = await fetch(`/api/admin/exchanges?search_output=${encodeURIComponent(query)}`, { headers });
        const json = await res.json();
        setResults(json.data || []);
      }
>>>>>>> Stashed changes
    }
    if (query) fetchResults();
  }, [query, supabase]);

  return (
    <div className="max-w-5xl bg-pv-surface-elevated mx-auto mt-12">
      <h2 className="text-lg font-semibold mb-4">
        Search Results for &quot;{query}&quot;
      </h2>
      <EventsList events={results} />
    </div>
  );
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
