import Link from 'next/link';
import { getBoundsCenter } from '@/app/utils/formatBounds';
import { useRouter, useParams } from 'next/navigation';
import { SearchBar } from '../SearchBar';
import { Region } from '@/types/region';

interface RegionTopBarProps {
  region?: {
    name?: string;
    bounds?: Region["bounds"];
  };
}

export function RegionTopBar({ region }: RegionTopBarProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  return (
    <div className="bg-pv-background p-6 mb-10 shadow-md rounded-lg border border-pv-accent-border flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-white mb-2 text-left">
          {region?.name || "Region"}
        </h1>
        {region && (
          <div className="text-left text-gray-300 mb-2">
            Location: {getBoundsCenter(region.bounds) || "N/A"}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center flex-1">
        <div className="w-full max-w-md mx-auto border-2 border-pv-accent-border rounded-lg">
          <SearchBar
            placeholder={`Search ${region?.name || 'this region'}'s shops...`}
            apiEndpoint={`/api/user/exchanges?region=${slug}`}
            onResultClick={event => router.push(`/search?query=${encodeURIComponent(event.output_item_id ?? '')}&region=${slug}`)}
            onSubmit={query => router.push(`/search?query=${encodeURIComponent(query)}&region=${slug}`)}
          />
        </div>
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