import React from "react";
import EventsList from "./EventList";
import { ShopWithEvents } from "@/types/shop";


export default function ShopCard({ shop }: { shop: ShopWithEvents }) {
  return (
    <div className="bg-pv-surface rounded-lg shadow p-6 text-white">
      <h2 className="text-2xl font-semibold mb-2">{shop.name}</h2>
      <div className="text-gray-300 mb-2">Owner: {shop.owner}</div>
      <div className="text-gray-300 mb-4">
        Created: {new Date(shop.created_at).toLocaleString()}
      </div>
      <div>
        <h3 className="font-semibold mb-1">Events:</h3>
        <EventsList events={shop.events} />
      </div>
    </div>
  );
}