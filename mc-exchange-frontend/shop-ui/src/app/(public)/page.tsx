"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase';
import { Shop} from '@/types/shop';

const REGION_ID = "674669d5-d977-4925-b5f3-16792f0fca18";



interface ShopItem {
  id: string;
  name: string;
  // Add other fields as needed
}

type ShopWithItems = Shop & { items: ShopItem[] };

export default function HomePage() {
  const [shops, setShops] = useState<ShopWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShopsAndItems() {
      setLoading(true);
      // Fetch shops for the region
      const res = await fetch(`/api/regions/${REGION_ID}/shops`);
      const data = await res.json();
      if (data && data.shops) {
        // For each shop, fetch its items (assuming an endpoint exists)
        const shopsWithItems = await Promise.all(
          data.shops.map(async (shop: Shop) => {
            // Replace with your actual API endpoint for shop items if different
            const itemsRes = await fetch(`/api/shops/${shop.id}/items`);
            const itemsData = await itemsRes.json();
            return { ...shop, items: itemsData.items || [] };
          })
        );
        setShops(shopsWithItems);
      }
      setLoading(false);
    }
    fetchShopsAndItems();
  }, []);

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
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Region Shops</h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {shops.length === 0 ? (
              <div className="text-center text-gray-500">No shops found for this region.</div>
            ) : (
              shops.map(shop => (
                <div key={shop.id} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-2 text-blue-800">{shop.name}</h2>
                  <div className="text-gray-600 mb-2">Owner: {shop.owner}</div>
                  <div className="text-gray-600 mb-4">Created: {new Date(shop.created_at).toLocaleString()}</div>
                  <div>
                    <h3 className="font-semibold mb-1">Items:</h3>
                    {shop.items && shop.items.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {shop.items.map(item => (
                          <li key={item.id}>{item.name}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400">No items in this shop.</div>
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