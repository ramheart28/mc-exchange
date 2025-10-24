"use client";
import React, { useEffect, useState } from "react";
import { Shop, ShopWithEvents } from "@/types/shop";
import ShopCard from "@/components/user/ShopCard";
import RegionTopBar from "@/components/user/RegionTopBar";
import { useParams } from "next/navigation";

export default function RegionPage() {
  const params = useParams();
  const slug = params.slug as string;
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
    <div className="min-h-screen">
      {region && <RegionTopBar region={region} />}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div>
            {shops.length === 0 ? (
              <div className="text-center text-gray-500">No shops found for this region.</div>
            ) : (
              shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)
            )}
          </div>
        )}
      </div>
  );
}