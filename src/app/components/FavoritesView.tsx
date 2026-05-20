import { Heart } from 'lucide-react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface FavoritesViewProps {
  favorites: Property[];
  onToggleFavorite: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onOpenChat: (property: Property) => void;
}

export function FavoritesView({ favorites, onToggleFavorite, onViewDetails, onOpenChat }: FavoritesViewProps) {
  if (favorites.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Пока нет избранных</h2>
          <p className="text-gray-600">Начните искать и сохраняйте понравившиеся квартиры!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Избранное ({favorites.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={true}
            onToggleFavorite={() => onToggleFavorite(property.id)}
            onViewDetails={() => onViewDetails(property)}
            onOpenChat={() => onOpenChat(property)}
          />
        ))}
      </div>
    </div>
  );
}
