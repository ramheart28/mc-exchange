"use client";
import React, { useState, useEffect } from 'react';
import OwnerTopBar from '@/components/Owner/OwnerTopBar';
import { Shop } from '@/types/shop';
import ShopCard from '@/components/Owner/OwnerShopCards';
import { supabaseBrowser } from '@/lib/supabase';
import ShopEditAddModal from '@/components/Owner/ShopEditAddModal';

export default function OwnerHomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const supabase = supabaseBrowser();

  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }
        const response = await fetch('/api/regions', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch regions');
        }
        const data = await response.json();
        setRegions(data.regions || []);
        if (data.regions && data.regions.length > 0) {
          setSelectedRegion(data.regions[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  // Fetch shops when selectedRegion changes
  useEffect(() => {
    const fetchShops = async () => {
      if (!selectedRegion) {
        setShops([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Not authenticated');
          setShops([]);
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/regions/${selectedRegion.id}/shops`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch shops');
        }
        const data = await response.json();
        setShops(data.shops || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [selectedRegion, supabase.auth]);

  // Modal handlers
  const handleAddShop = () => {
    setEditingShop(null);
    setModalOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setEditingShop(shop);
    setModalOpen(true);
  };

  const handleShopSubmit = async (shopData: Partial<Shop>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      if (!selectedRegion) {
        setError('No region selected');
        setLoading(false);
        return;
      }

      if (editingShop) {
        // EDIT: PATCH /api/regions/:id/shops
        const patchPayload = {
          shop_id: editingShop.id,
          name: shopData.name,
          owner: shopData.owner,
          // Add other editable fields if needed
        };
        const response = await fetch(`/api/regions/${selectedRegion.id}/shops`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(patchPayload)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to edit shop');
        }
      } else {
        // ADD: POST /api/regions/:id/shops
        const response = await fetch(`/api/regions/${selectedRegion.id}/shops`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shopData)
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create shop');
        }
      }

      // Refresh shops after add/edit
      const shopsRes = await fetch(`/api/regions/${selectedRegion.id}/shops`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      const shopsData = await shopsRes.json();
      setShops(shopsData.shops || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditingShop(null);
    }
  };

  // Prepare region info for OwnerTopBar
  const regionName = selectedRegion?.name || '';
  const shopCount = shops.length;
  const lastUpdated = selectedRegion?.updated_at || '';
  const cords = selectedRegion?.cords || '';
  const owners = selectedRegion?.owners || [];

  return (
    <div className="p-3">
      <div>
        <OwnerTopBar
          name={regionName}
          shopCount={shopCount}
          lastUpdated={lastUpdated}
          bounds={selectedRegion?.bounds || []}
          owners={owners}
          onAddShop={handleAddShop}
        />
      </div>

      {error && (
        <div className="p-4 mb-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      <div className="p-8 flex justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pv-primary"></div>
            <span className="ml-3 text-pv-text-secondary">Loading...</span>
          </div>
        ) : (
          <div className="inline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full">
            {shops.map((shop, index) => (
              <ShopCard
                key={shop.name || index}
                shop={shop}
                onEdit={handleEditShop}
                onDelete={(shopName) => console.log('Delete shop:', shopName)}
              />
            ))}
          </div>
        )}
      </div>

      <ShopEditAddModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingShop(null);
        }}
        onSubmit={handleShopSubmit}
        regionId={selectedRegion?.id || ""}
        owner={selectedRegion?.owner || ""}
        initialShop={editingShop}
      />

      <div>
        <p> Basic Stats</p>
      </div>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p>Beacon Market</p>
      </footer>
    </div>
  );
}