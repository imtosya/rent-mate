import { X, Upload, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Property } from '../types';
import { uploadApi } from '../../api/api';

interface ListPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: any) => void;
  editingProperty?: Property | null;
}

export function ListPropertyForm({ isOpen, onClose, onSubmit, editingProperty }: ListPropertyFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    rooms: '1',
    type: 'apartment',
    roommates: '',
    petFriendly: false,
    genderPreference: 'any',
    amenities: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Загрузка данных при редактировании
  useEffect(() => {
    if (editingProperty) {
      setFormData({
        title: editingProperty.title,
        description: editingProperty.description,
        price: editingProperty.price.toString(),
        location: editingProperty.location,
        rooms: editingProperty.rooms?.toString() || '1',
        type: editingProperty.type || 'apartment',
        roommates: editingProperty.roommates?.toString() || '',
        petFriendly: editingProperty.petFriendly || false,
        genderPreference: editingProperty.genderPreference || 'any',
        amenities: editingProperty.amenities || [],
      });
    } else {
      // Сброс формы при создании нового объявления
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        rooms: '1',
        type: 'apartment',
        roommates: '',
        petFriendly: false,
        genderPreference: 'any',
        amenities: [],
      });
    }
  }, [editingProperty, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const property = editingProperty
      ? {
          ...editingProperty,
          ...formData,
          price: Number(formData.price),
          rooms: Number(formData.rooms),
          roommates: formData.roommates ? Number(formData.roommates) : 0,
          typeRu:
            formData.type === 'apartment'
              ? 'Квартира'
              : formData.type === 'room'
              ? 'Комната'
              : formData.type === 'studio'
              ? 'Студия'
              : 'Дом',
        }
      : {
          id: Date.now().toString(),
          ...formData,
          price: Number(formData.price),
          rooms: Number(formData.rooms),
          roommates: formData.roommates ? Number(formData.roommates) : 0,
          rating: 0,
          image: 'https://images.unsplash.com/photo-1680416124510-5eae1beca412?w=1080',
          reviews: [],
          typeRu:
            formData.type === 'apartment'
              ? 'Квартира'
              : formData.type === 'room'
              ? 'Комната'
              : formData.type === 'studio'
              ? 'Студия'
              : 'Дом',
          gallery: ['https://images.unsplash.com/photo-1680416124510-5eae1beca412?w=1080'],
          owner: {
            id: 'current-user',
            name: 'Вы',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
            rating: 4.8,
            verified: true,
          },
        };

    onSubmit(property);
    onClose();

    // Сброс формы
    setFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      rooms: '1',
      type: 'apartment',
      roommates: '',
      petFriendly: false,
      genderPreference: 'any',
      amenities: [],
    });
    setNewAmenity('');
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {editingProperty ? 'Редактировать объявление' : 'Разместить объявление'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Название объявления *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="например, Уютная студия в Асанбае"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Описание *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишите вашу квартиру..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Цена в месяц (сом) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="20000"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Локация *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="например, Асанбай, Бишкек"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Тип жилья *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white transition-all"
                  >
                    <option value="apartment">Квартира</option>
                    <option value="room">Комната</option>
                    <option value="studio">Студия</option>
                    <option value="house">Дом</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Количество комнат *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Текущие соседи
                  </label>
                  <input
                    type="number"
                    value={formData.roommates}
                    onChange={(e) => setFormData({ ...formData, roommates: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Предпочтение по полу
                  </label>
                  <select
                    value={formData.genderPreference}
                    onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white transition-all"
                  >
                    <option value="any">Любой</option>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.petFriendly}
                    onChange={(e) => setFormData({ ...formData, petFriendly: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer transition-all"
                  />
                  <span className="text-sm font-semibold text-gray-900">Можно с животными</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Удобства</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                    placeholder="Добавить удобство (например, Wi-Fi, Парковка)"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={addAmenity}
                    className="px-4 py-3 bg-[var(--accent)] text-[var(--primary)] rounded-xl hover:bg-[var(--primary)] hover:text-white transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-[var(--emerald-950)] text-white rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Фотографии</label>
                <label
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-700 transition-colors cursor-pointer block">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400"/>
                  <p className="text-gray-600 mb-1">{uploading ? 'Загрузка...' : 'Нажмите для загрузки фото'}</p>
                  <p className="text-sm text-gray-400">PNG, JPG до 10MB</p>
                  <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        setUploading(true);
                        try {
                          const urls = await Promise.all(files.map(f => uploadApi.uploadImage(f)));
                          setGallery(prev => [...prev, ...urls]);
                        } catch (err: any) {
                          alert(err.message || 'Ошибка загрузки');
                        } finally {
                          setUploading(false);
                        }
                      }}
                  />
                </label>
                {gallery.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {gallery.map((url, i) => (
                          <div key={i} className="relative">
                            <img src={url} className="w-20 h-20 object-cover rounded-xl"/>
                            <button
                                type="button"
                                onClick={() => setGallery(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >×
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex space-x-3">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Отмена
              </button>
              <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium"
              >
                {editingProperty ? 'Сохранить изменения' : 'Разместить объявление'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
