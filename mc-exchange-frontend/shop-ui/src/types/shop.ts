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
