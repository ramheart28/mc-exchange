import {Bounds} from './region';

export interface Shop {
    name: string;
    created_at: string; // ISO String
    auther: string;
    owner: string;
    dimension: string;
    bounds: Bounds[];
    image?: string; // URL to image
}
