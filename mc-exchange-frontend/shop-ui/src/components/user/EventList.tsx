'use client';
import { ShopEvent } from "@/types/shop";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const ALL_TABS = ["For Sale", "Buying", "Trade"] as const;
type TabType = typeof ALL_TABS[number];

function getEventType(event: ShopEvent): TabType {
  const forSaleInputs = ["diamond", "iron_ingot", "iron_ingots"];
  if (forSaleInputs.includes(event.input_item_id)) return "For Sale";
  if (event.output_item_id === "diamond") return "Buying";
  return "Trade";
}

interface EventsListProps {
  events: ShopEvent[];
  showLocation?: boolean;
}

export default function EventsList({ events, showLocation = true }: EventsListProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Only show tabs that have at least one event
  const availableTabs = React.useMemo(
    () => ALL_TABS.filter(tab => events.some(e => getEventType(e) === tab)),
    [events]
  );
  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0] || "For Sale");

  // Reset activeTab to 'For Sale' (or first available) whenever availableTabs changes
  useEffect(() => {
    setActiveTab(availableTabs[0] || "For Sale");
  }, [availableTabs]);

  const formatItemId = (id: string) =>
    id
      .split("_")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");

  const renderDescriptors = (
    descriptors: Array<{ label: string; color: string }>
  ) => {
    if (!descriptors || descriptors.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5">
        {descriptors.map((d, i) => {
          let bg = "";
          let text = "";
          switch (d.color) {
            case "red":
              bg = "bg-red-500/15";
              text = "text-red-400";
              break;
            case "blue":
              bg = "bg-blue-500/15";
              text = "text-blue-400";
              break;
          }
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

  const mapToImageId = (idString: string) => {
    let out = idString;
    if (idString.endsWith("_armor_trim")) out = `${out}_smithing_template`;
    else if (idString === "eye_of_ender") out = "ender_eye";
    return out;
  };

  const renderItemCell = (
    id: string | number,
    qty: number,
    isCompacted?: boolean,
    enchantments?: string[]
  ) => {
    const idString = String(id);
    const hasFailed = failedImages.has(idString);
    const imageId = mapToImageId(idString);

    let descriptors: Array<{ label: string; color: string }> = [];
    if (isCompacted)
      descriptors = [...descriptors, { label: "Compacted", color: "red" }];
    if (enchantments)
      descriptors = [
        ...descriptors,
        ...enchantments.map((enchantment) => ({
          label: enchantment,
          color: "blue",
        })),
      ];

    return (
      <div className="flex flex-col items-center ">
        {!hasFailed && (
          <div className="relative inline-block rounded">
            <Image
              src={`https://mc.nerothe.com/img/1.21.8/minecraft_${imageId}.png`}
              alt={idString}
              width={32}
              height={32}
              onError={() =>
                setFailedImages((prev) => {
                  const next = new Set(prev);
                  next.add(idString);
                  return next;
                })
              }
            />
            <span
              className={`absolute bottom-0 right-0 translate-x-1 translate-y-1 rounded-sm bg-black/70 px-1 text-[11px] font-semibold leading-none ${
                isCompacted ? "text-red-400" : "text-white"
              }`}
            >
              {qty}
            </span>
          </div>
        )}
        <div className="mt-1 text-xs text-center">{formatItemId(idString)}</div>
        <div className="mt-1">{renderDescriptors(descriptors)}</div>
      </div>
    );
  };

  // Filter events by tab
  const filteredEvents = events.filter((event) => getEventType(event) === activeTab);

  return (
    <div>
      {/* Tabs */}
      {availableTabs.length > 0 && (
        <div className="mb-4 flex gap-2">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-t ${
                activeTab === tab
                  ? "bg-pv-surface-elevated border rounded-lg border-pv-accent-border text-white"
                  : "bg-pv-surface text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-pv-border rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-pv-border">
            <tr>
              <th className="px-3 py-2 border-b border-gray-700 text-center">Input</th>
              <th className="px-3 py-2 border-b border-gray-700 text-center"></th>
              <th className="px-3 py-2 border-b border-gray-700 text-center">Output</th>
              {showLocation && (
                <th className="px-3 py-2 border-b border-gray-700 text-center">Location</th>
              )}
              <th className="px-3 py-2 border-b border-gray-700 text-center">Exchanges</th>
              <th className="px-3 py-2 border-b border-gray-700 text-center">Date</th>
            </tr>
          </thead>
          <tbody>
          <tr>
            <td colSpan={showLocation ? 6 : 5} className="p-0">
              <div className="h-1 w-full bg-white-100" />
            </td>
          </tr>
          {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-6">
                  No {activeTab.toLowerCase()} events.
                </td>
              </tr>
            ) : (
              filteredEvents.map((event, idx) => (
                <tr
                  key={event.ts + event.input_item_id + event.output_item_id}
                  className={
                    `${idx % 2 === 0 ? 'bg-pv-surface-elevated' : 'bg-pv-border'} hover:bg-gray-700`
                  }
                >
                  <td className="px-3 py-2 text-center align-middle">
                    {renderItemCell(
                      event.input_item_id,
                      event.input_qty,
                      !!event.compacted_input && event.compacted_input !== "false",
                      Array.isArray(event.input_enchantments)
                        ? event.input_enchantments
                        : typeof event.input_enchantments === "string"
                        ? [event.input_enchantments]
                        : undefined
                    )}
                  </td>
                  <td className="px-3 py-2 text-center align-middle text-white/70 text-lg">→</td>
                  <td className="px-3 py-2 text-center align-middle">
                    {renderItemCell(
                      event.output_item_id,
                      event.output_qty,
                      !!event.compacted_output && event.compacted_output !== "false",
                      Array.isArray(event.output_enchantments)
                        ? event.output_enchantments
                        : typeof event.output_enchantments === "string"
                        ? [event.output_enchantments]
                        : undefined
                    )}
                  </td>
                  {showLocation && (
                    <td className="px-3 py-2 text-center align-middle">
                      <div>
                        {typeof event.shop === 'object' && event.shop !== null && 'name' in event.shop
                          ? (event.shop as { name: string }).name
                          : event.shop}
                      </div>
                      <div className="text-xs text-gray-400">({event.x}, {event.y}, {event.z})</div>
                    </td>
                  )}
                  <td className="px-3 py-2 text-center align-middle">{event.exchange_possible}</td>
                  <td className="px-3 py-2 text-center align-middle">
                    {new Date(event.ts).toLocaleDateString(undefined, {
                      month: "2-digit",
                      day: "2-digit",
                    })}{" "}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}