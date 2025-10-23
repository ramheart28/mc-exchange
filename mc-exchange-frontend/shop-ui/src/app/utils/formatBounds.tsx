import { Bounds } from '@/types/region';

// Parse string format "(5,5,5,10,10,10)" to object with correct property names
export const parseBounds = (boundString: string) => {
    const coords = boundString.slice(1, -1).split(',').map(Number);
    return {
        minx: coords[0],
        miny: coords[1], 
        minz: coords[2],
        maxx: coords[3],
        maxy: coords[4],
        maxz: coords[5]
    };
};

// Parse an array of bound strings
export const parseShopBounds = (bounds: string[]) => {
    return bounds.map(boundString => parseBounds(boundString));
};

// Format Bounds objects for display
export const formatBounds = (bounds: Bounds[]) => {
    if (!bounds || bounds.length === 0) {
        return { corner1: 'No data', corner2: 'No data' };
    }
    
    const bound = bounds[0];
    return {
        corner1: `${bound.minx}, ${bound.miny}, ${bound.minz}`,
        corner2: `${bound.maxx}, ${bound.maxy}, ${bound.maxz}`
    };
};

// Format as single string
export const formatBoundsString = (bounds: Bounds[]) => {
    if (!bounds || bounds.length === 0) {
        return 'No bounds data';
    }
    
    const bound = bounds[0];
    return `${bound.minx},${bound.miny},${bound.minz} to ${bound.maxx},${bound.maxy},${bound.maxz}`;
};

// Utility to handle both string and object formats
export const formatMixedBounds = (bounds: (string | Bounds)[]) => {
    if (!bounds || bounds.length === 0) {
        return { corner1: 'No data', corner2: 'No data' };
    }
    
    const bound = bounds[0];
    
    // If it's a string, parse it first
    if (typeof bound === 'string') {
        const parsed = parseBounds(bound);
        return {
            corner1: `${parsed.minx}, ${parsed.miny}, ${parsed.minz}`,
            corner2: `${parsed.maxx}, ${parsed.maxy}, ${parsed.maxz}`
        };
    }
    
    // If it's already an object
    return {
        corner1: `${bound.minx}, ${bound.miny}, ${bound.minz}`,
        corner2: `${bound.maxx}, ${bound.maxy}, ${bound.maxz}`
    };
};