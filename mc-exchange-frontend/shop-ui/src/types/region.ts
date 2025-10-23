export interface Region {
    id: string;
    created_at: string; // ISO String
    name:string;
    slug:string;
    dimension:string;
    bounds: Bounds[];
    shops: string[];
    owners: RegionOwners[];
}

export interface Bounds {
    min_x: number;
    min_y: number;
    min_z: number;
    max_x: number;
    max_y: number;
    max_z: number;
}
export interface RegionOwners {
    region_id: string;
    owners: string[];
}