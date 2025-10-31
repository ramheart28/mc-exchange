'use client';
import React, { useEffect, useState } from "react";
import { supabaseBrowser } from '@/lib/supabase';

interface Region {
  id: string;
  name: string;
  owners: string[] | null;
  bounds: any[];
  dimension: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  regions?: string[];
}

export default function AdminPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRegion, setNewRegion] = useState({ name: "", slug: "", dimension: "", owner: "" });
  const [minX, setMinX] = useState("");
  const [minY, setMinY] = useState("");
  const [minZ, setMinZ] = useState("");
  const [maxX, setMaxX] = useState("");
  const [maxY, setMaxY] = useState("");
  const [maxZ, setMaxZ] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<{ regionId: string, userId: string } | null>(null);
  const supabase = supabaseBrowser();

  // Fetch regions and users
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const [regionsRes, usersRes] = await Promise.all([
        fetch("/api/admin/regions", { headers }),
        fetch("/api/admin/users", { headers }),
      ]);
      const regionsJson = await regionsRes.json();
      const usersJson = await usersRes.json();
      // Ensure owners is always an array
      const safeRegions = (regionsJson.data || regionsJson.regions || []).map((r: Region) => ({
        ...r,
        owners: Array.isArray(r.owners) ? r.owners : [],
      }));
      setRegions(safeRegions);
      setUsers(usersJson.data || usersJson.users || []);
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Create region handler
  async function handleCreateRegion(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const x1 = Number(minX), x2 = Number(maxX);
    const y1 = Number(minY), y2 = Number(maxY);
    const z1 = Number(minZ), z2 = Number(maxZ);

    const boundsObj = {
      min_x: Math.min(x1, x2),
      max_x: Math.max(x1, x2),
      min_y: Math.min(y1, y2),
      max_y: Math.max(y1, y2),
      min_z: Math.min(z1, z2),
      max_z: Math.max(z1, z2),
    };

    await fetch("/api/admin/regions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...newRegion,
        owners: [newRegion.owner],
        bounds: [boundsObj],
      }),
    });
    setShowCreate(false);
    setNewRegion({ name: "", slug: "", dimension: "", owner: "" });
    setMinX(""); setMinY(""); setMinZ(""); setMaxX(""); setMaxY(""); setMaxZ("");
    // Refresh regions
    const refreshHeaders: Record<string, string> = {};
    if (token) refreshHeaders['Authorization'] = `Bearer ${token}`;
    const regionsRes = await fetch("/api/admin/regions", { headers: refreshHeaders });
    const regionsJson = await regionsRes.json();
    const safeRegions = (regionsJson.data || regionsJson.regions || []).map((r: Region) => ({
      ...r,
      owners: Array.isArray(r.owners) ? r.owners : [],
    }));
    setRegions(safeRegions);
  }

  // Delete region handler
  async function handleDeleteRegion(id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await fetch(`/api/admin/regions/${id}`, { method: "DELETE", headers });
    setRegions(regions.filter(region => region.id !== id));
  }

  // Assign user as owner to region (add to region.owners)
  async function handleAssignOwnerToRegion(userId: string, region: Region) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const ownersArr = Array.isArray(region.owners) ? region.owners : [];
    if (ownersArr.includes(userId)) return;
    const updatedOwners = [...ownersArr, userId];

    // Debug logs
    console.log("PATCH owners:", updatedOwners, typeof updatedOwners, Array.isArray(updatedOwners));
    console.log("PATCH body:", JSON.stringify({
      name: region.name,
      slug: region.slug,
      dimension: region.dimension,
      owners: updatedOwners,
      bounds: region.bounds,
    }));

    await fetch(`/api/admin/regions/${region.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        name: region.name,
        slug: region.slug,
        dimension: region.dimension,
        owners: updatedOwners,
        bounds: region.bounds,
      }),
    });
    // Refresh regions
    const regionsRes = await fetch("/api/admin/regions", { headers });
    const regionsJson = await regionsRes.json();
    const safeRegions = (regionsJson.data || regionsJson.regions || []).map((r: Region) => ({
      ...r,
      owners: Array.isArray(r.owners) ? r.owners : [],
    }));
    setRegions(safeRegions);
  }

  // Remove owner from region (after confirmation)
  async function handleRemoveOwnerFromRegion(region: Region, userId: string) {
    setConfirmRemove({ regionId: region.id, userId });
  }

  async function confirmRemoveOwner() {
    if (!confirmRemove) return;
    const { regionId, userId } = confirmRemove;
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const region = regions.find(r => r.id === regionId);
    if (!region) return;
    const ownersArr = Array.isArray(region.owners) ? region.owners : [];
    const updatedOwners = ownersArr.filter(id => id !== userId);

    // PATCH must send all required fields!
    await fetch(`/api/admin/regions/${region.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        name: region.name,
        slug: region.slug,
        dimension: region.dimension,
        owners: updatedOwners,
        bounds: region.bounds,
      }),
    });
    setConfirmRemove(null);
    // Refresh regions
    const regionsRes = await fetch("/api/admin/regions", { headers });
    const regionsJson = await regionsRes.json();
    const safeRegions = (regionsJson.data || regionsJson.regions || []).map((r: Region) => ({
      ...r,
      owners: Array.isArray(r.owners) ? r.owners : [],
    }));
    setRegions(safeRegions);
  }

  function getUserEmail(userId: string) {
    return users.find(u => u.id === userId)?.email || userId;
  }

  async function handleAssignRegion(userId: string, regionId: string) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const region = regions.find(r => r.id === regionId);
    if (!region) return;
    const ownersArr = Array.isArray(region.owners) ? region.owners : [];
    if (ownersArr.includes(userId)) return; // Already an owner
    const updatedOwners = [...ownersArr, userId];

    // Debug logs
    console.log("PATCH owners:", updatedOwners, typeof updatedOwners, Array.isArray(updatedOwners));
    console.log("PATCH body:", JSON.stringify({
      name: region.name,
      slug: region.slug,
      dimension: region.dimension,
      owners: updatedOwners,
      bounds: region.bounds,
    }));

    await fetch(`/api/admin/regions/${region.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        name: region.name,
        slug: region.slug,
        dimension: region.dimension,
        bounds: region.bounds,
        owners: updatedOwners,
      }),
    });
    // Refresh regions
    const regionsRes = await fetch("/api/admin/regions", { headers });
    const regionsJson = await regionsRes.json();
    const safeRegions = (regionsJson.data || regionsJson.regions || []).map((r: Region) => ({
      ...r,
      owners: Array.isArray(r.owners) ? r.owners : [],
    }));
    setRegions(safeRegions);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
        <h1 className="text-xl font-bold">Admin Page</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => setShowCreate(v => !v)}
        >
          Create Region
        </button>
      </div>

      {/* Create Region Modal */}
      {showCreate && (
        <div className="bg-gray-800 p-6 rounded shadow-md max-w-md mx-auto my-8">
          <form onSubmit={handleCreateRegion} className="flex flex-col gap-3">
            <input
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Name"
              value={newRegion.name}
              onChange={e => setNewRegion(r => ({ ...r, name: e.target.value }))}
              required
            />
            <input
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Slug"
              value={newRegion.slug}
              onChange={e => setNewRegion(r => ({ ...r, slug: e.target.value }))}
              required
            />
            <input
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Dimension"
              value={newRegion.dimension}
              onChange={e => setNewRegion(r => ({ ...r, dimension: e.target.value }))}
              required
            />
            <input
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Owner"
              value={newRegion.owner}
              onChange={e => setNewRegion(r => ({ ...r, owner: e.target.value }))}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1">Bounds</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min X"
                  value={minX}
                  onChange={e => setMinX(e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  placeholder="Max X"
                  value={maxX}
                  onChange={e => setMaxX(e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  placeholder="Min Y"
                  value={minY}
                  onChange={e => setMinY(e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Y"
                  value={maxY}
                  onChange={e => setMaxY(e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  placeholder="Min Z"
                  value={minZ}
                  onChange={e => setMinZ(e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                />
                <input
                  type="number"
                  placeholder="Max Z"
                  value={maxZ}
                  onChange={e => setMaxZ(e.target.value)}
                  className="border rounded px-2 py-1"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Create</button>
              <button type="button" className="bg-gray-700 px-4 py-2 rounded" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Remove Owner Modal */}
      {confirmRemove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-md max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Remove Owner</h3>
            <p>
              Are you sure you want to remove <span className="font-bold">{getUserEmail(confirmRemove.userId)}</span> from this region?
            </p>
            <div className="flex gap-2 mt-6 justify-end">
              <button
                className="bg-gray-700 px-4 py-2 rounded"
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
                onClick={confirmRemoveOwner}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Regions List */}
      <div className="max-w-3xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-4">Regions</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {regions.map(region => (
              <div key={region.id} className="bg-gray-800 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold">{region.name}</div>
                  <div className="flex flex-wrap gap-2 my-2">
                    {region.owners && region.owners.length > 0 ? (
                      region.owners.map(ownerId => (
                        <span
                          key={ownerId}
                          className="flex items-center bg-blue-700 text-white rounded-full px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-blue-800 transition relative group"
                        >
                          {getUserEmail(ownerId)}
                          <button
                            className="ml-2 text-white bg-blue-900 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            title="Remove owner"
                            onClick={() => handleRemoveOwnerFromRegion(region, ownerId)}
                            type="button"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">No owners</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Dimension: {region.dimension}</div>
                  <div className="text-sm text-gray-400">
                    Bounds: {region.bounds && region.bounds.length > 0
                      ? `(${region.bounds[0].min_x},${region.bounds[0].min_y},${region.bounds[0].min_z}) → (${region.bounds[0].max_x},${region.bounds[0].max_y},${region.bounds[0].max_z})`
                      : "None"}
                  </div>
                  {/* Assign owner dropdown */}
                  <div className="mt-2">
                    <select
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                      defaultValue=""
                      onChange={e => {
                        if (e.target.value) handleAssignOwnerToRegion(e.target.value, region);
                      }}
                    >
                      <option value="" disabled>Add owner to region...</option>
                      {users
                        .filter(u => !(Array.isArray(region.owners) ? region.owners : []).includes(u.id))
                        .map(user => (
                          <option key={user.id} value={user.id}>{user.email}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded mt-2 md:mt-0"
                  onClick={() => handleDeleteRegion(region.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="bg-gray-800 rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold">{user.email}</div>
                  <div className="text-sm text-gray-400">Regions: {user.regions?.join(", ") || "None"}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <select
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) handleAssignRegion(user.id, e.target.value);
                    }}
                  >
                    <option value="" disabled>Assign as owner to region</option>
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}