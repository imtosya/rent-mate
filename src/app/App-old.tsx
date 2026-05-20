import { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { FilterPanel } from './components/FilterPanel';
import { AIChatAssistant } from './components/AIChatAssistant';
import { UserProfile } from './components/UserProfile';
import { ListPropertyForm } from './components/ListPropertyForm';
import { FavoritesView } from './components/FavoritesView';
import { MessagesView } from './components/MessagesView';
import { NotificationsView } from './components/NotificationsView';
import { Property, Filters } from './types';
import { Plus } from 'lucide-react';

const CURRENT_USER_ID = 'current-user';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 100000],
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isListPropertyOpen, setIsListPropertyOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [chatProperty, setChatProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [properties, setProperties] = useState<Property[]>([
    {
      id: '1',
      title: 'Современная студия в центре Бишкека',
      description: 'Красивая студия в самом центре города. Идеально для студентов с легким доступом к университетам и общественному транспорту. Полностью меблирована с современными удобствами.',
      price: 25000,
      location: 'Центр, Чуй-Абдрахманова',
      image: 'https://images.unsplash.com/photo-1680416124510-5eae1beca412?w=1080',
      rating: 4.8,
      rooms: 1,
      roommates: 0,
      type: 'studio',
      typeRu: 'Студия',
      petFriendly: false,
      genderPreference: 'any',
      amenities: ['Wi-Fi', 'Отопление', 'Кондиционер', 'Стиральная машина', 'Парковка'],
      gallery: [
        'https://images.unsplash.com/photo-1680416124510-5eae1beca412?w=1080',
        'https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?w=1080',
        'https://images.unsplash.com/photo-1663811397207-418a92396ad5?w=1080',
      ],
      owner: {
        id: 'owner1',
        name: 'Гульмира Токтогулова',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        rating: 4.9,
        verified: true,
        bio: 'Управляющая недвижимостью с 5-летним опытом. Предоставляю качественное жилье.',
        joinDate: 'Март 2022',
      },
      reviews: [
        {
          id: 'r1',
          user: {
            id: 'u1',
            name: 'Мирлан Касымов',
            avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
            rating: 4.7,
            verified: true,
          },
          rating: 5,
          comment: 'Потрясающее место! Очень чисто и расположение идеальное. Владелица отзывчивая и всегда помогает.',
          date: '15 Марта 2024',
        },
        {
          id: 'r2',
          user: {
            id: 'u2',
            name: 'Айжан Эсенбаева',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
            rating: 4.8,
            verified: true,
          },
          rating: 5,
          comment: 'Отличная студия для студентов. Близко ко всему необходимому!',
          date: '28 Февраля 2024',
        },
      ],
      ownerId: 'owner1',
    },
    {
      id: '2',
      title: 'Уютная комната рядом с КРСУ',
      description: 'Просторная комната в общей квартире возле Кыргызско-Российского Славянского Университета. Отлично для студентов, желающих сэкономить на аренде и жить с дружелюбными соседями.',
      price: 12000,
      location: 'Асанбай, район КРСУ',
      image: 'https://images.unsplash.com/photo-1616486232086-81d47190669a?w=1080',
      rating: 4.5,
      rooms: 1,
      roommates: 3,
      type: 'room',
      typeRu: 'Комната',
      petFriendly: true,
      genderPreference: 'any',
      amenities: ['Wi-Fi', 'Общая кухня', 'Комната для учебы', 'Велопарковка'],
      gallery: [
        'https://images.unsplash.com/photo-1616486232086-81d47190669a?w=1080',
        'https://images.unsplash.com/photo-1657040899601-fbcc8f6486f6?w=1080',
      ],
      owner: {
        id: 'owner2',
        name: 'Данияр Исаков',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        rating: 4.6,
        verified: true,
        bio: 'Специалист по студенческому жилью. Понимаю, что нужно студентам!',
        joinDate: 'Январь 2023',
      },
      reviews: [],
      ownerId: 'owner2',
    },
    {
      id: '3',
      title: 'Роскошная 2-комнатная с видом на горы',
      description: 'Премиум 2-комнатная квартира с потрясающим видом на горы. Современная кухня, просторная гостиная и премиум отделка.',
      price: 45000,
      location: 'Джал, Skyline Heights',
      image: 'https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=1080',
      rating: 4.9,
      rooms: 2,
      roommates: 1,
      type: 'apartment',
      typeRu: 'Квартира',
      petFriendly: false,
      genderPreference: 'female',
      amenities: ['Wi-Fi', 'Спортзал', 'Бассейн', 'Консьерж', 'Парковка', 'Балкон'],
      gallery: [
        'https://images.unsplash.com/photo-1653972233597-05822baa3c4e?w=1080',
        'https://images.unsplash.com/photo-1643376452350-97eadd2c417f?w=1080',
      ],
      owner: {
        id: 'owner3',
        name: 'Анара Асанова',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
        rating: 5.0,
        verified: true,
        bio: 'Ищу ответственную девушку для совместного проживания в этой прекрасной квартире.',
        joinDate: 'Июнь 2023',
      },
      reviews: [],
      ownerId: 'owner3',
    },
    {
      id: '4',
      title: 'Доступное студенческое жилье',
      description: 'Бюджетная комната, идеальная для студентов. Базовые удобства с акцентом на доступность и удобство.',
      price: 8000,
      location: 'Южные микрорайоны, рядом с КГТУ',
      image: 'https://images.unsplash.com/photo-1644082089290-0b8f2764e15f?w=1080',
      rating: 4.2,
      rooms: 1,
      roommates: 2,
      type: 'room',
      typeRu: 'Комната',
      petFriendly: false,
      genderPreference: 'male',
      amenities: ['Wi-Fi', 'Общая кухня', 'Стиральная машина'],
      gallery: [
        'https://images.unsplash.com/photo-1644082089290-0b8f2764e15f?w=1080',
      ],
      owner: {
        id: 'owner4',
        name: 'Тимур Жумабаев',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        rating: 4.3,
        verified: true,
        bio: 'Сдаю комнаты студентам уже более 3 лет.',
        joinDate: 'Сентябрь 2021',
      },
      reviews: [],
      ownerId: 'owner4',
    },
    {
      id: '5',
      title: 'Квартира с садом для любителей животных',
      description: 'Уютная квартира на первом этаже с доступом к частному саду. Идеально для владельцев питомцев! Тихий район с парками неподалеку.',
      price: 28000,
      location: 'Ала-Тоо, зеленая зона',
      image: 'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=1080',
      rating: 4.7,
      rooms: 2,
      roommates: 0,
      type: 'apartment',
      typeRu: 'Квартира',
      petFriendly: true,
      genderPreference: 'any',
      amenities: ['Wi-Fi', 'Сад', 'Парковка', 'Зона для питомцев', 'Кладовка'],
      gallery: [
        'https://images.unsplash.com/photo-1638454668466-e8dbd5462f20?w=1080',
        'https://images.unsplash.com/photo-1638454795595-0a0abf68614d?w=1080',
      ],
      owner: {
        id: 'owner5',
        name: 'Лилия Зеленина',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
        rating: 4.8,
        verified: true,
        bio: 'Любительница животных и природы. Приветствуются все питомцы!',
        joinDate: 'Апрель 2023',
      },
      reviews: [],
      ownerId: 'owner5',
    },
    {
      id: '6',
      title: 'Общий дом с комнатой для учебы',
      description: 'Большой дом с индивидуальными комнатами и общими пространствами. Специальная комната для учебы, идеальная для студентов. Дружеская атмосфера.',
      price: 15000,
      location: 'Студенческий городок, рядом с АУ',
      image: 'https://images.unsplash.com/photo-1692455067486-d4637182a61c?w=1080',
      rating: 4.6,
      rooms: 1,
      roommates: 4,
      type: 'house',
      typeRu: 'Дом',
      petFriendly: false,
      genderPreference: 'any',
      amenities: ['Wi-Fi', 'Комната для учебы', 'Общая кухня', 'Игровая комната', 'Двор'],
      gallery: [
        'https://images.unsplash.com/photo-1692455067486-d4637182a61c?w=1080',
      ],
      owner: {
        id: 'owner6',
        name: 'Роберт Ли',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        rating: 4.5,
        verified: true,
        bio: 'Создаю поддерживающую среду для студентов с 2020 года.',
        joinDate: 'Август 2020',
      },
      reviews: [],
      ownerId: 'owner6',
    },
  ]);

  // Фильтрация квартир
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !property.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (searchLocation && !property.location.toLowerCase().includes(searchLocation.toLowerCase())) {
        return false;
      }

      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
        return false;
      }

      if (filters.rooms && property.rooms !== filters.rooms) {
        return false;
      }

      if (filters.rating && property.rating < filters.rating) {
        return false;
      }

      if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      if (filters.type && property.type !== filters.type) {
        return false;
      }

      if (filters.petFriendly && !property.petFriendly) {
        return false;
      }

      if (filters.genderPreference && filters.genderPreference !== '' && property.genderPreference !== 'any' && property.genderPreference !== filters.genderPreference) {
        return false;
      }

      return true;
    });
  }, [properties, searchQuery, searchLocation, filters]);

  // Квартиры пользователя
  const userProperties = useMemo(() => {
    return properties.filter((property) => property.ownerId === CURRENT_USER_ID);
  }, [properties]);

  // Избранное
  const favoriteProperties = useMemo(() => {
    return properties.filter((property) => favoriteIds.has(property.id));
  }, [properties, favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
  };

  const handleApplyFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleOpenChat = (property: Property) => {
    setChatProperty(property);
    setIsChatOpen(true);
  };

  const handleAddProperty = (property: Property) => {
    const newProperty = {
      ...property,
      ownerId: CURRENT_USER_ID,
      typeRu: property.type === 'apartment' ? 'Квартира' : property.type === 'room' ? 'Комната' : property.type === 'studio' ? 'Студия' : 'Дом',
    };
    setProperties([...properties, newProperty]);
    setIsListPropertyOpen(false);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsListPropertyOpen(true);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(properties.map(p => p.id === updatedProperty.id ? { ...updatedProperty, ownerId: CURRENT_USER_ID } : p));
    setEditingProperty(null);
    setIsListPropertyOpen(false);
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это объявление?')) {
      setProperties(properties.filter(p => p.id !== propertyId));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'favorites':
        return (
          <FavoritesView
            favorites={favoriteProperties}
            onToggleFavorite={toggleFavorite}
            onViewDetails={handleViewDetails}
            onOpenChat={handleOpenChat}
          />
        );
      case 'messages':
        return <MessagesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'profile':
        return (
          <UserProfile
            userProperties={userProperties}
            onEditProperty={handleEditProperty}
            onDeleteProperty={handleDeleteProperty}
            currentUserId={CURRENT_USER_ID}
          />
        );
      default:
        return (
          <>
            <HeroSection onSearch={handleSearch} onOpenFilters={() => setIsFilterOpen(true)} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {searchQuery || searchLocation ? 'Результаты поиска' : 'Рекомендуемые квартиры'}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'квартира' : filteredProperties.length < 5 ? 'квартиры' : 'квартир'}
                  </p>
                </div>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Квартиры не найдены</h3>
                  <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска или фильтры</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchLocation('');
                      setFilters({ priceRange: [0, 100000] });
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      isFavorite={favoriteIds.has(property.id)}
                      onToggleFavorite={() => toggleFavorite(property.id)}
                      onViewDetails={() => handleViewDetails(property)}
                      onOpenChat={() => handleOpenChat(property)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        notificationCount={3}
        messageCount={2}
      />

      {renderContent()}

      <button
        onClick={() => {
          setEditingProperty(null);
          setIsListPropertyOpen(true);
        }}
        className="fixed bottom-8 right-8 px-6 py-4 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-2 font-medium hover:scale-105 z-40"
      >
        <Plus className="w-5 h-5" />
        <span>Разместить объявление</span>
      </button>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onOpenChat={() => {
            handleOpenChat(selectedProperty);
            setSelectedProperty(null);
          }}
        />
      )}

      <AIChatAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        property={chatProperty || undefined}
      />

      <ListPropertyForm
        isOpen={isListPropertyOpen}
        onClose={() => {
          setIsListPropertyOpen(false);
          setEditingProperty(null);
        }}
        onSubmit={editingProperty ? handleUpdateProperty : handleAddProperty}
      />
    </div>
  );
}
