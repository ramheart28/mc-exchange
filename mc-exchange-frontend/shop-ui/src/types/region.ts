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
    minx: number;
    miny: number;
    minz: number;
    maxx: number;
    maxy: number;
    maxz: number;
}
export interface RegionOwners {
    region_id: string;
    owners: string[];
}