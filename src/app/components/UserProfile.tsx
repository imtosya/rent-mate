import { Star, Edit, LogOut, Calendar, Home as HomeIcon, Heart, MessageCircle, Trash2, Pencil } from 'lucide-react';
import { Property, User as UserType } from '../types';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  verified: boolean;
}

interface UserProfileProps {
  onClose?: () => void;
  userProperties?: Property[];
  onEditProperty?: (property: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  currentUserId?: string;
  currentUser?: CurrentUser;
}

export function UserProfile({ userProperties = [], onEditProperty, onDeleteProperty, currentUserId = 'current-user', currentUser }: UserProfileProps) {
  const user: UserType = {
    id: currentUserId,
    name: currentUser?.name || 'Алексей Иванов',
    email: currentUser?.email || 'aleksey.ivanov@example.com',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    rating: currentUser?.rating || 4.8,
    verified: currentUser?.verified || true,
    joinDate: 'Январь 2024',
    bio: 'Студент Кыргызско-Российского Славянского Университета, ищу дружелюбных соседей и удобное жилье.',
  };

  const stats = {
    listings: userProperties.length,
    favorites: 12,
    reviews: 15,
  };

  const rentalHistory = [
    {
      id: '1',
      title: 'Современная студия в центре',
      period: 'Янв 2024 - Настоящее время',
      rating: 5,
    },
    {
      id: '2',
      title: 'Общая квартира рядом с КРСУ',
      period: 'Авг 2023 - Дек 2023',
      rating: 4,
    },
  ];

  const userReviews = [
    {
      id: '1',
      propertyTitle: 'Уютная 2-комнатная в Асанбае',
      rating: 5,
      comment: 'Отличная квартира! Очень чисто, и расположение идеальное. Владелец отзывчивый и всегда помогает.',
      date: '15 Марта 2024',
      reviewer: 'Гульнара Бекова',
    },
    {
      id: '2',
      propertyTitle: 'Студия в центре Бишкека',
      rating: 5,
      comment: 'Прекрасное место для студентов. Близко ко всему необходимому!',
      date: '28 Февраля 2024',
      reviewer: 'Нурбек Асанов',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-br from-[var(--emerald-950)] to-[var(--forest-green)] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
              <p className="text-white/80 mb-1">{user.email}</p>
              {currentUser?.phone && (
                <p className="text-white/80 mb-2">{currentUser.phone}</p>
              )}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-300 fill-current" />
                  <span className="font-semibold">{user.rating}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>Регистрация {user.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center space-x-2">
            <Edit className="w-4 h-4" />
            <span>Редактировать</span>
          </button>
        </div>

        <p className="text-white/90 mb-6">{user.bio}</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <HomeIcon className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.listings}</div>
            <div className="text-sm text-white/80">Мои объявления</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Heart className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.favorites}</div>
            <div className="text-sm text-white/80">Избранное</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <MessageCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1">{stats.reviews}</div>
            <div className="text-sm text-white/80">Отзывы</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Мои объявления ({userProperties.length})</h2>
        {userProperties.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-4">У вас пока нет размещенных объявлений</p>
            <p className="text-sm text-gray-500">Нажмите кнопку "Разместить объявление" чтобы добавить свою квартиру</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="font-semibold text-[var(--emerald-950)]">
                        {property.price.toLocaleString('ru-RU')} сом/мес
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{property.rating}</span>
                      </div>
                      {property.reviews && property.reviews.length > 0 && (
                        <span className="text-gray-500">
                          {property.reviews.length} {property.reviews.length === 1 ? 'отзыв' : property.reviews.length < 5 ? 'отзыва' : 'отзывов'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditProperty?.(property)}
                    className="p-2 text-[var(--primary)] hover:bg-[var(--accent)] rounded-lg transition-all duration-300"
                    title="Редактировать"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDeleteProperty?.(property.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">История аренды</h2>
        <div className="space-y-3">
          {rentalHistory.map((rental) => (
            <div
              key={rental.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{rental.title}</h3>
                <p className="text-sm text-gray-600">{rental.period}</p>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rental.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Мои отзывы ({userReviews.length})</h2>
        <div className="space-y-4">
          {userReviews.map((review) => (
            <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{review.propertyTitle}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{review.comment}</p>
              <p className="text-sm text-gray-500">— {review.reviewer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Настройки</h2>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
            Настройки уведомлений
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
            Настройки конфиденциальности
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
            Способы оплаты
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
            Верификация
          </button>
        </div>
      </div>

      <button className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 font-medium flex items-center justify-center space-x-2">
        <LogOut className="w-5 h-5" />
        <span>Выйти</span>
      </button>
    </div>
  );
}
