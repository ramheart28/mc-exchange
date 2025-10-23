import { formatBounds } from '@/app/utils/formatBounds';

interface RegionCardProps {
  shopCount: string | number;
  lastUpdated: string;
  owners: string[];
  bounds: any[]; // Pass the region's bounds array here
}

export default function RegionCard({
  shopCount,
  lastUpdated,
  owners,
  bounds,
}: RegionCardProps) {
  const boundsData = formatBounds(bounds);

  return (
    <div className="flex flex-wrap gap-4 justify-around m-4">
      <div className="flex-1 min-w-[200px] bg-pv-surface border-pv-border border-2 p-6 rounded-lg shadow space-y-2">
        <p className="text-lg text-pv-muted">Shop Count:</p>
        <p className="font-bold text-2xl text-pv-text-primary">{shopCount}</p>
      </div>
      <div className="flex-1 min-w-[200px] bg-pv-surface border-pv-border border-2 p-6 rounded-lg shadow space-y-2">
        <p className="text-lg text-pv-muted">Last Updated:</p>
        <p className="font-bold text-2xl text-pv-text-primary">{lastUpdated}</p>
      </div>
      <div className="flex-1 min-w-[200px] bg-pv-surface border-pv-border border-2 p-6 rounded-lg shadow space-y-2">
        <p className="text-lg text-pv-muted">Region Bounds:</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-pv-text-secondary text-xs">Corner 1:</span>
            <span className="text-pv-text-primary text-xs font-mono bg-pv-surface px-2 py-1 rounded">
              {boundsData.corner1}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-pv-text-secondary text-xs">Corner 2:</span>
            <span className="text-pv-text-primary text-xs font-mono bg-pv-surface px-2 py-1 rounded">
              {boundsData.corner2}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-[200px] bg-pv-surface border-pv-border border-2 p-6 rounded-lg shadow space-y-2">
        <p className="text-lg text-center text-pv-muted">Owners:</p>
        <p className="font-bold text-2xl text-center text-pv-text-primary">
          {owners.join(', ')}
        </p>
      </div>
    </div>
  );
}

// Top Bar with Region Name, Shop Count, Last Updated, Cords, Region Owners