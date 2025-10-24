import Link from 'next/link';
// Update the import path below if the file is located elsewhere, for example:
// Update the import path below if the file is located elsewhere, for example:
// import getBoundsCenter from '../utils/formatBounds';
import { getBoundsCenter } from '@/app/utils/formatBounds';

export default function RegionTopBar({ region }: { region: { name: string; bounds: string[] } }) {
  return (
    <div className="bg-pv-background p-6 mb-10 shadow-md rounded-lg border border-pv-accent-border flex items-start justify-between">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 text-left">
          {region?.name || "Region"}
        </h1>
        {region && (
          <div className="text-left text-gray-300 mb-0">
            Location: {getBoundsCenter(region.bounds) || "N/A"}
          </div>
        )}
      </div>
      <div className="flex items-start">
        <Link
          href="/login"
          className="bg-pv-surface-elevated hover:bg-pv-secondary border border-pv-accent-border text-white px-6 py-2 rounded-lg font-medium transition-colors w-auto"
        >
          Nation Owner
        </Link>
      </div>
    </div>
  );
}

// Shop Count
