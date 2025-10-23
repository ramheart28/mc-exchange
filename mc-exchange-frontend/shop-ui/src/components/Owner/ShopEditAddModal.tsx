import React, { useState, useEffect } from "react";
import { Shop } from "@/types/shop";
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ShopEditAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (shop: Partial<Shop>) => void;
  regionId: string;
  owner: string;
  initialShop?: Shop | null; // If present, modal is "edit" mode
}

export default function ShopEditAddModal({
  open,
  onClose,
  onSubmit,
  regionId,
  owner: initialOwner,
  initialShop,
}: ShopEditAddModalProps) {
  const isEdit = !!initialShop;

  const [name, setName] = useState(initialShop?.name || "");
  const [dimension, setDimension] = useState(initialShop?.dimension || "overworld");
  const [minX, setMinX] = useState(initialShop?.bounds?.[0]?.min_x ?? "");
  const [minY, setMinY] = useState(initialShop?.bounds?.[0]?.min_y ?? "");
  const [minZ, setMinZ] = useState(initialShop?.bounds?.[0]?.min_z ?? "");
  const [maxX, setMaxX] = useState(initialShop?.bounds?.[0]?.max_x ?? "");
  const [maxY, setMaxY] = useState(initialShop?.bounds?.[0]?.max_y ?? "");
  const [maxZ, setMaxZ] = useState(initialShop?.bounds?.[0]?.max_z ?? "");
  const [owner, setOwner] = useState(initialShop?.owner || initialOwner || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialShop) {
      setName(initialShop.name || "");
      setDimension(initialShop.dimension || "overworld");
      setMinX(initialShop.bounds?.[0]?.min_x ?? "");
      setMinY(initialShop.bounds?.[0]?.min_y ?? "");
      setMinZ(initialShop.bounds?.[0]?.min_z ?? "");
      setMaxX(initialShop.bounds?.[0]?.max_x ?? "");
      setMaxY(initialShop.bounds?.[0]?.max_y ?? "");
      setMaxZ(initialShop.bounds?.[0]?.max_z ?? "");
      setOwner(initialShop.owner || initialOwner || "");
    } else if (open) {
      setName("");
      setDimension("overworld");
      setMinX("");
      setMinY("");
      setMinZ("");
      setMaxX("");
      setMaxY("");
      setMaxZ("");
      setOwner(initialOwner || "");
    }
  }, [initialShop, open, initialOwner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Shop name is required.");
    if (!owner.trim()) return setError("Owner is required.");
    if (!isEdit && [minX, minY, minZ, maxX, maxY, maxZ].some((v) => v === "")) {
      return setError("All bounds are required.");
    }

    // Parse all values as numbers
    const x1 = Number(minX), x2 = Number(maxX);
    const y1 = Number(minY), y2 = Number(maxY);
    const z1 = Number(minZ), z2 = Number(maxZ);

    // Always assign min/max correctly
    const boundsObj = {
      min_x: Math.min(x1, x2),
      max_x: Math.max(x1, x2),
      min_y: Math.min(y1, y2),
      max_y: Math.max(y1, y2),
      min_z: Math.min(z1, z2),
      max_z: Math.max(z1, z2),
    };

    const shopData: Partial<Shop> = {
      ...(isEdit && initialShop?.id ? { id: initialShop.id } : {}),
      name,
      owner,
      dimension,
      bounds: isEdit ? initialShop?.bounds : [boundsObj],
    };

    onSubmit(shopData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <div className="bg-black border border-pv-accent-border rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* X Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-pv-accent-border hover:text-white p-1 rounded-full focus:outline-none"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">
          {isEdit ? "Edit Shop" : "Create Shop"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Shop Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          {!isEdit && (
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
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="submit" className="px-4 py-2 rounded-lg bg-pv-border border border-pv-accent-border text-white hover:bg-pv-primary-dark">
              {isEdit ? "Save Changes" : "Create Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}