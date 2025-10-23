// components/Owner/ShopCard.tsx
import { useState } from 'react';
import EditAddShopButton from './EditAddShopButton';
import { Shop } from '@/types/shop';
import { formatBounds} from '@/app/utils/formatBounds';

interface ShopCardProps {
  shop: Shop;
  onEdit?: (shop: Shop) => void;
  onDelete?: (shopName: string) => void;
}

export default function ShopCard({ shop, onEdit, onDelete }: ShopCardProps) {
  const [imageError, setImageError] = useState(false);

  // Format created date
  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const fallbackImage = "/shop-icon.png";
  const displayImage = imageError ? fallbackImage : (shop.image || fallbackImage);
  
  // Get formatted bounds
  const boundsData = formatBounds(shop.bounds);

  return (
    <div className="bg-pv-surface-elevated border border-pv-border p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-100">
      {/* Shop Image */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img
            src={displayImage}
            alt={`${shop.name} icon`}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      </div>

      {/* Shop Name */}
      <h3 className="text-xl font-bold text-pv-text-primary text-center mb-4">
        {shop.name}
      </h3>

      {/* Shop Details */}
      <div className="space-y-3 mb-6">        
        <div className="flex justify-between">
          <span className="text-pv-text-secondary text-sm">Owner:</span>
          <span className="text-pv-text-primary text-sm font-medium">{shop.owner}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-pv-text-secondary text-sm">Created:</span>
          <span className="text-pv-text-primary text-sm font-medium">{formatDate(shop.created_at)}</span>
        </div>
        
        <div className="border-t border-pv-border pt-3">
          <span className="text-pv-text-secondary text-sm block mb-2">Shop Bounds:</span>
          
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
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <EditAddShopButton
          mode="edit"
          shopData={{
            name: shop.name,
            owner: shop.owner,
            bounds: `${boundsData.corner1} to ${boundsData.corner2}`,
            // Add other fields as needed for your button
          }}
          onClick={() => onEdit?.(shop)}
          className="flex-1"
        />
        
        <button
          onClick={() => onDelete?.(shop.name)}
          className="
            bg-red-600 
            hover:bg-red-700 
            text-white 
            px-4 py-2 
            rounded-lg 
            font-medium 
            transition-colors 
            duration-200
            hover:shadow-lg
            active:scale-95
          "
        >
          Delete
        </button>
      </div>
    </div>
  );
}