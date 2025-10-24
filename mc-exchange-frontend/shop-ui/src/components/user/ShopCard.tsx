import React, { useState } from "react";
import EventsList from "./EventList";
import { ShopWithEvents } from "@/types/shop";
import { getBoundsCenter } from "@/app/utils/formatBounds";

const FALLBACK_IMG = "/shop-icon.png"; 

export default function ShopCard({ shop }: { shop: ShopWithEvents }) {
  const [imgError, setImgError] = useState(false);
  const displayImage = !imgError && shop.image ? shop.image : FALLBACK_IMG;

  return (
    <div className="bg-pv-surface rounded-lg shadow p-6 text-white">
      <div className="flex items-center mb-2">
        {/* Shop Image */}
        <div className="w-30 h-30 bg-white rounded-lg border border-pv-border flex items-center justify-center overflow-hidden mr-4">
          <img
            src={displayImage}
            alt={`${shop.name} icon`}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImgError(true)}
          />
        </div>
        {/* Shop Info */}
        <div>
          <h2 className="text-2xl font-semibold border rounded-lg inline-block border-pv-accent-border px-2 py-1 mb-1">
            {shop.name}
          </h2>
          <div className="text-gray-300">Owner: {shop.owner}</div>
          <div className="text-gray-300">
            Location: {getBoundsCenter(shop.bounds) || "N/A"}
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Inventory:</h3>
        <EventsList events={shop.events} />
      </div>
    </div>
  );
}