import { X, MapPin, Star, Users, Home, Bed, Check, MessageCircle, Phone, Mail, Calendar } from 'lucide-react';
import { Property } from '../types';
import { useState } from 'react';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onOpenChat: () => void;
}

export function PropertyDetailModal({ property, onClose, onOpenChat }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = property.gallery || [property.image];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Детали объявления</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="relative h-96 bg-gray-900">
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center space-x-1 text-gray-600 mb-2">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
                <span>{property.location}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-500 text-sm">({property.reviews?.length || 0} {property.reviews?.length === 1 ? 'отзыв' : property.reviews?.length && property.reviews.length < 5 ? 'отзыва' : 'отзывов'})</span>
                </div>
                {property.roommates && (
                  <div className="flex items-center space-x-1 text-gray-700">
                    <Users className="w-5 h-5 text-[var(--primary)]" />
                    <span>{property.roommates} {property.roommates === 1 ? 'сосед' : property.roommates < 5 ? 'соседа' : 'соседей'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[var(--emerald-950)] mb-1">
                {property.price.toLocaleString('ru-RU')} сом
              </div>
              <div className="text-gray-500 text-sm">в месяц</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {property.rooms && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Bed className="w-5 h-5 text-[var(--primary)]" />
                <span>{property.rooms} {property.rooms === 1 ? 'комната' : property.rooms < 5 ? 'комнаты' : 'комнат'}</span>
              </div>
            )}
            {property.type && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Home className="w-5 h-5 text-[var(--primary)]" />
                <span className="capitalize">{property.typeRu || property.type}</span>
              </div>
            )}
            {property.petFriendly !== undefined && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Check className="w-5 h-5 text-green-600" />
                <span>{property.petFriendly ? 'С животными' : 'Без животных'}</span>
              </div>
            )}
            {property.genderPreference && (
              <div className="flex items-center space-x-2 text-gray-700">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                <span className="capitalize">
                  {property.genderPreference === 'any' ? 'Любой пол' : property.genderPreference === 'male' ? 'Мужской' : 'Женский'}
                </span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Описание</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Удобства</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Владелец</h3>
            <div className="flex items-start space-x-4 bg-gray-50 p-4 rounded-xl">
              <img
                src={property.owner.avatar}
                alt={property.owner.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{property.owner.name}</h4>
                  {property.owner.verified && (
                    <Check className="w-5 h-5 text-blue-600 fill-current" />
                  )}
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">{property.owner.rating} rating</span>
                </div>
                {property.owner.bio && (
                  <p className="text-sm text-gray-600 mb-3">{property.owner.bio}</p>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>На платформе с {property.owner.joinDate || 'недавно'}</span>
                </div>
              </div>
            </div>
          </div>

          {property.reviews && property.reviews.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Отзывы ({property.reviews.length})</h3>
              <div className="space-y-4">
                {property.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-start space-x-3 mb-2">
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-gray-900">{review.user.name}</h5>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={onOpenChat}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Чат с AI помощником</span>
            </button>
            <button className="p-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-3 border-2 border-[var(--primary)] text-[var(--primary)] rounded-xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
