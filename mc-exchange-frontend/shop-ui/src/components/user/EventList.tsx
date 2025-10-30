'use client';
import { ShopEvent } from "@/types/shop";
import Image from "next/image";
import React, { useState } from "react";

export default function EventsList({ events }: { events: ShopEvent[] }) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const formatItemId = (id: string) => {
    return id
      .split("_")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  };
  const renderDescriptors = (
    descriptors: Array<{ label: string }>
  ) => {
    if (!descriptors || descriptors.length === 0) return null;
    return (
      <div className="flex flex-col items-start gap-1">
        {descriptors.map((d, i) => {
          const bg = "bg-red-500/15";
          const text = "text-red-400";
          return (
            <span
              key={`${d.label}-${i}`}
              className={`rounded ${bg} px-1.5 py-0.5 text-[11px] font-medium ${text}`}
            >
              {d.label}
            </span>
          );
        })}
      </div>
    );
  };
  const renderItem = (id: string | number, qty: number, isCompacted?: boolean) => {
    const idString = String(id);
    const hasFailed = failedImages.has(idString);
    const imageId = idString.endsWith("_armor_trim") ? `${idString}_smithing_template` : idString;
    return (
      <div className="flex w-full items-center gap-4">
        <div className="flex items-center gap-3">
          {!hasFailed && (
            <div className={`relative inline-block rounded p-1`}>
              <Image
                src={`https://mc.nerothe.com/img/1.21.8/minecraft_${imageId}.png`}
                alt={idString}
                width={28}
                height={28}
                onError={() =>
                  setFailedImages((prev) => {
                    const next = new Set(prev);
                    next.add(idString);
                    return next;
                  })
                }
              />
              <span className={`absolute bottom-0 right-0 translate-x-1 translate-y-1 rounded-sm bg-black/70 px-1 text-[12px] font-semibold leading-none ${isCompacted ? "text-red-400" : "text-white"}`}>
                {qty}
              </span>
            </div>
          )}
          <span className="text-base">
            {formatItemId(idString)}
          </span>
        </div>
        {renderDescriptors(isCompacted ? [{ label: "Compacted" }] : [])}
      </div>
    );
  };
  if (!events || events.length === 0) {
    return <div className="text-gray-400">No events for this shop.</div>;
  }
  return (
    <div className="overflow-x-auto ">
      <table className="min-w-full rounded shadow">
        <thead >
          <tr className="border-b border-pv-accent-border">
            <th className="px-4 py-2 text-left text-xs font-semibold text-white">Price</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-white ">Item</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-white">Exchanges Available</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-white">Last Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-pv-border">
          {events.map((event) => (
            <tr key={event.ts + event.input_item_id + event.output_item_id}>
              <td className="px-5 py-3 text-base text-white">
                {renderItem(event.input_item_id as any, event.input_qty as any, (event as any).compacted_input)}
              </td>
              <td className="px-5 py-3 text-base text-white">
                {renderItem(event.output_item_id as any, event.output_qty as any, (event as any).compacted_output)}
              </td>
              <td className="px-5 py-3 text-base text-white">
                {event.exchange_possible}
              </td>
              <td className="px-5 py-3 text-base text-white whitespace-nowrap">
                {new Date(event.ts).toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Add Compcated items
// Add Buy / Sell Indicators
// Infinite scroll or pagination for large event lists
