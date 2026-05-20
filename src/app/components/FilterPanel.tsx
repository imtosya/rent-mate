import { X, SlidersHorizontal } from 'lucide-react';
import { Filters } from '../types';
import { useState } from 'react';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApplyFilters: (filters: Filters) => void;
}

export function FilterPanel({ isOpen, onClose, filters, onApplyFilters }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: Filters = {
      priceRange: [0, 100000],
      rooms: undefined,
      rating: undefined,
      location: '',
      type: '',
      petFriendly: undefined,
      genderPreference: '',
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Фильтры</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Диапазон цены: {localFilters.priceRange[0].toLocaleString('ru-RU')} - {localFilters.priceRange[1].toLocaleString('ru-RU')} сом
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={localFilters.priceRange[0]}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceRange: [Number(e.target.value), localFilters.priceRange[1]],
                  })
                }
                className="w-full accent-[var(--primary)]"
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={localFilters.priceRange[1]}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceRange: [localFilters.priceRange[0], Number(e.target.value)],
                  })
                }
                className="w-full accent-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Количество комнат</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setLocalFilters({ ...localFilters, rooms: num })}
                  className={`py-2 rounded-lg font-medium transition-all ${
                    localFilters.rooms === num
                      ? 'bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Минимальный рейтинг</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setLocalFilters({ ...localFilters, rating })}
                  className={`py-2 rounded-lg font-medium transition-all ${
                    localFilters.rating === rating
                      ? 'bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating}★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Тип жилья</label>
            <select
              value={localFilters.type || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
            >
              <option value="">Все типы</option>
              <option value="apartment">Квартира</option>
              <option value="room">Комната</option>
              <option value="studio">Студия</option>
              <option value="house">Дом</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Локация</label>
            <input
              type="text"
              value={localFilters.location || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
              placeholder="Введите район..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Предпочтение по полу</label>
            <select
              value={localFilters.genderPreference || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, genderPreference: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
            >
              <option value="">Без предпочтений</option>
              <option value="any">Любой</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.petFriendly || false}
                onChange={(e) => setLocalFilters({ ...localFilters, petFriendly: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-900">Только с животными</span>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 space-y-3">
          <button
            onClick={handleApply}
            className="w-full px-6 py-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium"
          >
            Применить фильтры
          </button>
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </>
  );
}
