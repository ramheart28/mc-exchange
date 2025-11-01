'use client';
import React, { useEffect, useState } from "react";
import { supabaseBrowser } from '@/lib/supabase';
import { ShopEvent } from "@/types/shop";
import EventsList from "../../../../components/user/EventList";

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<ShopEvent[]>([]);
  const supabase = supabaseBrowser();

  useEffect(() => {
    async function fetchExchanges() {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch("/api/admin/exchanges", { headers });
      const json = await res.json();
      setExchanges(json.data || []);
    }
    fetchExchanges();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h2 className="text-lg font-semibold mb-4">All Exchanges</h2>
      <EventsList events={exchanges} />
    </div>
  );
}