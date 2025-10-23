// src/data/mockShops.ts
import { Shop } from '@/types/shop';

export const mockShops: Shop[] = [
  {
    name: "Diamond Exchange",
    created_at: "2024-01-15T10:30:00Z",
    auther: "PlayerOne",
    owner: "PlayerOne",
    dimension: "overworld",
    bounds: [
      {
        min_x: 100,
        min_y: 64,
        min_z: 200,
        max_x: 110,
        max_y: 74,
        max_z: 210
      }
    ],
  },
  {
    name: "Food Market",
    created_at: "2024-01-10T14:45:00Z",
    auther: "PlayerTwo",
    owner: "PlayerTwo",
    dimension: "overworld",
    bounds: [
      {
        min_x: 50,
        min_y: 64,
        min_z: 150,
        max_x: 60,
        max_y: 74,
        max_z: 160
      }
    ],
  },
  {
    name: "Redstone Emporium",
    created_at: "2024-01-20T09:15:00Z",
    auther: "TechMaster",
    owner: "TechMaster",
    dimension: "overworld",
    bounds: [
      {
        min_x: 300,
        min_y: 65,
        min_z: 400,
        max_x: 320,
        max_y: 80,
        max_z: 420
      }
    ],
  },
  {
    name: "Enchanted Books",
    created_at: "2024-01-25T16:20:00Z",
    auther: "BookWorm",
    owner: "BookWorm",
    dimension: "overworld",
    bounds: [
      {
        min_x: 250,
        min_y: 64,
        min_z: 350,
        max_x: 270,
        max_y: 75,
        max_z: 370
      }
    ],
  },
  {
    name: "Tool & Weapon Shop",
    created_at: "2024-02-01T11:30:00Z",
    auther: "Blacksmith",
    owner: "Blacksmith",
    dimension: "overworld",
    bounds: [
      {
        min_x: 400,
        min_y: 63,
        min_z: 500,
        max_x: 415,
        max_y: 78,
        max_z: 515
      }
    ],
  },
  {
    name: "Potion Brewery",
    created_at: "2024-02-05T13:45:00Z",
    auther: "Alchemist",
    owner: "Alchemist", 
    dimension: "overworld",
    bounds: [
      {
        min_x: 150,
        min_y: 64,
        min_z: 250,
        max_x: 165,
        max_y: 72,
        max_z: 265
      }
    ],
  },
  {
    name: "Building Blocks",
    created_at: "2024-02-10T08:00:00Z",
    auther: "Builder",
    owner: "Builder",
    dimension: "overworld",
    bounds: [
      {
        min_x: 500,
        min_y: 64,
        min_z: 600,
        max_x: 525,
        max_y: 85,
        max_z: 625
      }
    ],
  }
];