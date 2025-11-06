"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from '@/lib/supabase';
import EventsList from "@/components/user/EventList";
import { ShopEvent } from "@/types/shop";

export default function SearchResultsPage() {
  const [results, setResults] = useState<ShopEvent[]>([]);
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const supabase = supabaseBrowser();

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/admin/exchanges?search_output=${encodeURIComponent(query)}`, { headers });
      const json = await res.json();
      setResults(json.data || []);
    }
    if (query) fetchResults();
  }, [query]);

  return (
    <div className="max-w-5xl bg-pv-surface-elevated mx-auto mt-12">
      <h2 className="text-lg font-semibold mb-4">Search Results for "{query}"</h2>
      <EventsList events={results} />
    </div>
  );
}
