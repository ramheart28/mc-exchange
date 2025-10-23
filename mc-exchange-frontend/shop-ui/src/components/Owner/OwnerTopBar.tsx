// Top Bar with Region Name, Shop Count, Last Updated, Cords, Region Owners
// Add Shop Button

import EditAddShopButton from "./EditAddShopButton";
import RegionCard from "./RegionCard";


interface OwnerTopBarProps {
    name: string;
    shopCount: number;
    lastUpdated: string;
    bounds: any;
    owners: string[];
    onAddShop: () => void;
}


export default function OwnerTopBar({name, shopCount, lastUpdated, bounds, owners, onAddShop}: OwnerTopBarProps){
    return (
        <div className="flex flex-col border-pv-accent-border bg-pv-surface border-2 p-6  rounded-lg shadow">

            {/* Name & Add Shop Button*/}
            <div className="flex flex-wrap items-center justify-between gap-3 ">
                <h2 className="text-4xl m-2 pb-4 font-bold text-pv-secondary">{name}</h2>
                <EditAddShopButton mode="add" 
                onClick={onAddShop}/>
            </div>

            <RegionCard shopCount={shopCount} lastUpdated={lastUpdated} bounds={bounds} owners={owners} />

        </div>
    );
}



