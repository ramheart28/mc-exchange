import {Bounds} from './region';

export interface Shop {
    id: string;
    name: string;
    created_at: string; // ISO String
    owner: string;
    dimension: string;
    bounds: Bounds[];
    region: string;
    image?: string; // URL to image
}

export interface ShopEvent {
  [key: string]: unknown; 
  ts: string;
  input_item_id: string;
  input_qty: number;
  output_item_id: string;
  output_qty: number;
  exchange_possible: boolean;
  compacted_input: string;
  compacted_output: string;
  shop: string;
  x: number;
  y: number;
  z: number;
  output_enchantments?: string;
  input_enchantments?: string;
  output_item_name?: string;
  input_item_name?: string;
}

export type ShopWithEvents = Shop & { events: ShopEvent[] };