import { useState } from 'react';
import { Star, Edit, LogOut, Calendar, Home as HomeIcon, Heart, MessageCircle, Trash2, Pencil, X } from 'lucide-react';
import { Property, User as UserType } from '../types';
import { authApi } from '../../api/api';

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
  onLogout?: () => void;
  onUpdateUser?: (user: CurrentUser) => void;
  favoritesCount?: number;
  reviewsCount?: number;
  joinDate?: string;
}

export function UserProfile({ userProperties = [], onEditProperty, onDeleteProperty, currentUserId = 'current-user', currentUser, onLogout, onUpdateUser, favoritesCount = 0, reviewsCount = 0, joinDate = '' }: UserProfileProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [saving, setSaving] = useState(false);

  const user: UserType = {
    id: currentUserId,
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '',
    rating: currentUser?.rating || 0,
    verified: currentUser?.verified || false,
    joinDate: '',
    bio: '',
  };

  const stats = {
    listings: userProperties.length,
    favorites: favoritesCount,
    reviews: reviewsCount,
  };

  const rentalHistory: any[] = [];
  const userReviews: any[] = [];

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { user: updated } = await authApi.updateProfile({
        name: editName,
        phone: editPhone,
        avatar_url: editAvatar,
      });
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser!,
          name: updated.name,
          phone: updated.phone,
          avatar: updated.avatar,
        });
      }
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Модальное окно редактирования */}
        {isEditModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Редактировать профиль</h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={currentUser?.email || ''}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <input
                        type="text"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Фото профиля</label>
                    <label
                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 block transition-colors">
                      {editAvatar ? (
                          <img src={editAvatar} alt="preview" className="w-20 h-20 rounded-xl object-cover mx-auto"/>
                      ) : (
                          <div className="text-gray-400 text-sm">Нажмите для загрузки фото</div>
                      )}
                      <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const {uploadApi} = await import('../../api/api');
                              const url = await uploadApi.uploadImage(file);
                              setEditAvatar(url);
                            } catch (err: any) {
                              alert(err.message || 'Ошибка загрузки');
                            }
                          }}
                      />
                    </label>
                    {editAvatar && (
                        <button
                            type="button"
                            onClick={() => setEditAvatar('')}
                            className="mt-2 text-sm text-red-500 hover:text-red-700"
                        >
                          Удалить фото
                        </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </div>
            </div>
        )}

        <div
            className="bg-gradient-to-br from-[var(--emerald-950)] to-[var(--forest-green)] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              {user.avatar ? (
                  <img src={user.avatar} alt={user.name}
                       className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"/>
              ) : (
                  <div
                      className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/20">
                    <span className="text-3xl font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  </div>
              )}
              <div>
                <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                <p className="text-white/80 mb-1">{user.email}</p>
                {currentUser?.phone && <p className="text-white/80 mb-2">{currentUser.phone}</p>}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-300 fill-current" />
                    <span className="font-semibold">{user.rating}</span>
                  </div>
                  <div
                      className="flex items-center space-x-1 text-sm bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4"/>
                    <span>Регистрация {joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
                onClick={() => {
                  setEditName(currentUser?.name || '');
                  setEditPhone(currentUser?.phone || '');
                  setEditAvatar(currentUser?.avatar || '');
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Редактировать</span>
            </button>
          </div>

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
                <p className="text-sm text-gray-500">Нажмите кнопку "Добавить объявление" чтобы добавить свою квартиру</p>
              </div>
          ) : (
              <div className="space-y-4">
                {userProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4 flex-1">
                        <img src={property.image} alt={property.title} className="w-20 h-20 rounded-lg object-cover" />
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
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onEditProperty?.(property)}
                            className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all duration-300"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDeleteProperty?.(property.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        <button
            onClick={onLogout}
            className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>
  );
}