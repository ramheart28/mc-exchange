'use client';
import { ShopEvent } from "@/types/shop";
import React from "react";

export default function EventsList({ events }: { events: ShopEvent[] }) {
  if (!events || events.length === 0) {
    return <div className="text-gray-400">No events for this shop.</div>;
  }
  return (
    <div className="overflow-x-auto ">
      <table className="min-w-full rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-white">Price</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-white ">Item</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-white">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.ts + event.input_item_id + event.output_item_id}>
              <td className="px-4 py-2 text-sm text-white">
                {event.input_qty}x {event.input_item_id}
              </td>
              <td className="px-4 py-2 text-sm text-white">
                {event.output_qty}x {event.output_item_id}
              </td>
              <td className="px-4 py-2 text-sm text-white">
                {new Date(event.ts).toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}