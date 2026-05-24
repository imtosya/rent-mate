import { Search, MapPin, SlidersHorizontal } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string, location: string) => void;
  onOpenFilters: () => void;
}

export function HeroSection({ onSearch, onOpenFilters }: HeroSectionProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('query') as string;
    const location = formData.get('location') as string;
    onSearch(query, location);
  };

  return (
    <div className="relative bg-gradient-to-br from-[var(--emerald-950)] via-[var(--forest-green)] to-[var(--deep-emerald)] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Найдите Идеальное Жильё
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Откройте для себя лучшие квартиры в Бишкеке, найдите соседей и начните новую главу
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400"/>
              <input
                  type="text"
                  name="query"
                  placeholder="Поиск квартир, комнат, студий..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="flex-1 flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400"/>
              <input
                  type="text"
                  name="location"
                  placeholder="Район, микрорайон (например, Асанбай)"
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <button
                type="button"
                onClick={onOpenFilters}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2 md:w-auto"
            >
              <SlidersHorizontal className="w-5 h-5"/>
              <span className="font-medium">Фильтры</span>
            </button>

            <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium md:w-auto"
            >
              Найти
            </button>
          </div>
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            {label: 'Для студентов', query: 'студент'},
            {label: 'С животными', query: '', petFriendly: true},
            {label: 'Рядом с вузом', query: 'вуз'},
            {label: 'С мебелью', query: 'мебель'},
            {label: 'Комната', query: 'комната'},
          ].map((tag) => (
              <button
                  key={tag.label}
                  onClick={() => onSearch(tag.query, '')}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full text-sm font-medium transition-all duration-300 border border-white/20"
              >
                {tag.label}
              </button>
          ))}
        </div>
      </div>
    </div>
  );
}
