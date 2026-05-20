import { Heart, MapPin, Star, Users, Home, MessageCircle, Bed } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewDetails: () => void;
  onOpenChat: () => void;
}

export function PropertyCard({ property, isFavorite, onToggleFavorite, onViewDetails, onOpenChat }: PropertyCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer">
      <div className="relative h-56 overflow-hidden" onClick={onViewDetails}>
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
            isFavorite
              ? 'bg-red-500 text-white shadow-lg scale-110'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
          <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full flex items-center space-x-1 shadow-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-semibold text-gray-900">{property.rating}</span>
          </div>
          {property.roommates && (
            <div className="px-3 py-1.5 bg-[var(--emerald-950)]/95 backdrop-blur-sm text-white rounded-full flex items-center space-x-1 shadow-lg">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">{property.roommates} {property.roommates === 1 ? 'сосед' : property.roommates < 5 ? 'соседа' : 'соседей'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5" onClick={onViewDetails}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
            <div className="flex items-center space-x-1 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-[var(--primary)]" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-700">
          {property.rooms && (
            <div className="flex items-center space-x-1">
              <Bed className="w-4 h-4 text-[var(--primary)]" />
              <span>{property.rooms} {property.rooms === 1 ? 'комната' : property.rooms < 5 ? 'комнаты' : 'комнат'}</span>
            </div>
          )}
          {property.type && (
            <div className="flex items-center space-x-1">
              <Home className="w-4 h-4 text-[var(--primary)]" />
              <span className="capitalize">{property.typeRu || property.type}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-[var(--emerald-950)]">{property.price.toLocaleString('ru-RU')}</span>
            <span className="text-gray-500 text-sm">сом/мес</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 flex items-center space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium hover:scale-105"
        >
          Подробнее
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenChat();
          }}
          className="p-2.5 bg-[var(--accent)] text-[var(--primary)] rounded-xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
