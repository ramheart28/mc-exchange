'use client';
import React, { useEffect, useState } from "react";
import { supabaseBrowser } from '@/lib/supabase';

interface Region {
  id: string;
  name: string;
  owners: string[];
  bounds: any[]; // Now an array of bounds objects
  dimension: string;
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
      setRegions(regionsJson.data || regionsJson.regions || []);
      setUsers(usersJson.data || usersJson.users || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Create region handler
  async function handleCreateRegion(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // Parse all values as numbers and always assign min/max correctly
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
    setRegions((await regionsRes.json()).data || []);
  }

  // Delete region handler
  async function handleDeleteRegion(id: string) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await fetch(`/api/admin/regions/${id}`, { method: "DELETE", headers });
    setRegions(regions.filter(r => r.id !== id));
  }

  // Assign user as owner to region
  async function handleAssignRegion(userId: string, regionId: string) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ regions: [regionId], role: "owner" }),
    });
    // Optionally refresh users
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
                  <div className="text-sm text-gray-400">Owners: {region.owners?.join(", ") || "None"}</div>
                  <div className="text-sm text-gray-400">Dimension: {region.dimension}</div>
                  <div className="text-sm text-gray-400">
                    Bounds: {region.bounds && region.bounds.length > 0
                      ? `(${region.bounds[0].min_x},${region.bounds[0].min_y},${region.bounds[0].min_z}) → (${region.bounds[0].max_x},${region.bounds[0].max_y},${region.bounds[0].max_z})`
                      : "None"}
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