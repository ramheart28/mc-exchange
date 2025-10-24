"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shop, ShopEvent } from "@/types/shop";
import { useParams } from "next/navigation";

type ShopWithEvents = Shop & { events: ShopEvent[] };
interface RegionPageProps {
  slug: string;
}

export default function RegionPage({ slug }: RegionPageProps) {
  const [region, setRegion] = useState<{ id: string; name: string; bounds: string[] } | null>(null);
  const [shops, setShops] = useState<ShopWithEvents[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegionAndShops() {
      setLoading(true);

      // 1. Fetch region by slug
      const regionRes = await fetch(`/api/user/regions?slug=${slug}`);
      const regionData = await regionRes.json();
      const foundRegion = regionData.regions?.[0];
      setRegion(foundRegion);

      if (foundRegion) {
        // 2. Fetch shops for region
        const shopsRes = await fetch(`/api/user/regions/${slug}/shops`);
        const shopsData = await shopsRes.json();
        if (shopsData && shopsData.shops) {
          const shopsWithEvents = await Promise.all(
            shopsData.shops.map(async (shop: Shop) => {
              const eventsRes = await fetch(`/api/user/exchanges/shop?shop=${shop.id}`);
              const eventsData = await eventsRes.json();
              return { ...shop, events: eventsData.data || [] };
            })
          );
          setShops(shopsWithEvents);
        }
      }
      setLoading(false);
    }
    fetchRegionAndShops();
  }, [slug]);

  return (
    <div className="min-h-screen bg-black from-blue-50 to-purple-50">
      {/* Top bar with Login button */}
      <div className="flex justify-end p-4">
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Login
        </Link>
      </div>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          {region ? region.name : "Region"}
        </h1>
        {region && (
          <div className="text-center text-gray-300 mb-8">
            Bounds: {region.bounds?.join(" | ")}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {shops.length === 0 ? (
              <div className="text-center text-gray-500">No shops found for this region.</div>
            ) : (
              shops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-2 text-blue-800">{shop.name}</h2>
                  <div className="text-gray-600 mb-2">Owner: {shop.owner}</div>
                  <div className="text-gray-600 mb-4">
                    Created: {new Date(shop.created_at).toLocaleString()}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Events:</h3>
                    {shop.events && shop.events.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {shop.events.map((event) => (
                          <li key={event.ts + event.input_item_id + event.output_item_id}>
                            {event.input_qty}x {event.input_item_id} → {event.output_qty}x {event.output_item_id} at{" "}
                            {new Date(event.ts).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400">No events for this shop.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}