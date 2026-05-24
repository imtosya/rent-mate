import { X, MapPin, Star, Users, Home, Bed, Check, MessageCircle, Phone, Mail } from 'lucide-react';
import { Property } from '../types';
import { useState } from 'react';
import { reviewsApi } from '../../api/api';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onOpenChat: () => void;
  onOpenMessage?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  currentUserId?: string;
}

export function PropertyDetailModal({ property, onClose, onOpenChat, onOpenMessage, isFavorite, onToggleFavorite, currentUserId }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState(property.reviews || []);
  const [currentRating, setCurrentRating] = useState(property.rating);

  const images = property.gallery || [property.image];

  const handleSubmitReview = async () => {
    if (!currentUserId) {
      alert('Войди в аккаунт чтобы оставить отзыв');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.create({
        listing_id: property.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      const newReview = {
        id: Date.now().toString(),
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toLocaleDateString('ru-RU'),
        user: { id: currentUserId, name: 'Вы', avatar: '', rating: reviewRating, verified: true }
      };
      setReviews(prev => {
        const updated = [...prev, newReview];
        const avg = updated.reduce((sum, r) => sum + r.rating, 0) / updated.length;
        setCurrentRating(Math.round(avg * 10) / 10);
        return updated;
      });
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
    } catch (err: any) {
      alert(err.message || 'Ошибка отправки отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Детали объявления</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="relative h-96 bg-gray-900">
            <img src={images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover" />
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                  {images.map((_, idx) => (
                      <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80'}`}
                      />
                  ))}
                </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(currentRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-semibold">{currentRating}</span>
                  <span className="text-gray-500 text-sm">({reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-800">{property.price.toLocaleString('ru-RU')}</div>
                <div className="text-gray-500">сом/месяц</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <Bed className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="font-semibold">{property.rooms}</div>
                <div className="text-xs text-gray-500">комнат</div>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="font-semibold">{property.roommates}</div>
                <div className="text-xs text-gray-500">жильцов</div>
              </div>
              <div className="text-center">
                <Home className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="font-semibold">{property.typeRu}</div>
                <div className="text-xs text-gray-500">тип</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Описание</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Удобства</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {property.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center space-x-2 text-gray-700">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                    ))}
                  </div>
                </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-lg mb-3">Владелец</h3>
              <div className="flex items-center space-x-3">
                {property.owner.avatar ? (
                    <img src={property.owner.avatar} alt={property.owner.name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-800 font-bold">{property.owner.name?.[0]}</span>
                    </div>
                )}
                <div>
                  <h4 className="font-semibold">{property.owner.name}</h4>

                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Отзывы ({reviews.length})</h3>
                {currentUserId && currentUserId !== property.ownerId && (
                    <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm hover:bg-emerald-800 transition-colors"
                    >
                      {showReviewForm ? 'Отмена' : 'Оставить отзыв'}
                    </button>
                )}
              </div>

              {showReviewForm && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium">Оценка:</span>
                      {[1,2,3,4,5].map(star => (
                          <button key={star} onClick={() => setReviewRating(star)}>
                            <Star className={`w-6 h-6 ${star <= reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                          </button>
                      ))}
                    </div>
                    <textarea
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        placeholder="Напишите ваш отзыв..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        rows={3}
                    />
                    <button
                        onClick={handleSubmitReview}
                        disabled={submitting || !reviewComment.trim()}
                        className="mt-2 px-6 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>
              )}

              {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex items-start space-x-3">
                            {review.user.avatar ? (
                                <img src={review.user.avatar} alt={review.user.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <span className="text-emerald-800 font-bold text-sm">{review.user.name?.[0]}</span>
                                </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h5 className="font-semibold text-gray-900">{review.user.name}</h5>
                                <span className="text-xs text-gray-500">{review.date}</span>
                              </div>
                              <div className="flex items-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <p className="text-sm text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <p className="text-gray-500 text-sm">Пока нет отзывов. Будьте первым!</p>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
              <button
                  onClick={onOpenChat}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-900 to-emerald-700 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Чат с AI помощником</span>
              </button>
              <button
                  onClick={() => {
                    if (property.owner.phone) {
                      const isMobile = /iPhone|Android/i.test(navigator.userAgent);
                      if (isMobile) {
                        window.location.href = `tel:${property.owner.phone}`;
                      } else {
                        alert(`Телефон владельца: ${property.owner.phone}`);
                      }
                    } else {
                      alert('Телефон не указан');
                    }
                  }}
                  className="p-3 border-2 border-emerald-800 text-emerald-800 rounded-xl hover:bg-emerald-800 hover:text-white transition-all duration-300"
                  title={property.owner.phone || 'Телефон не указан'}
              >
                <Phone className="w-5 h-5" />
              </button>
              <button
                  onClick={onOpenMessage}
                  className="p-3 border-2 border-emerald-800 text-emerald-800 rounded-xl hover:bg-emerald-800 hover:text-white transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}