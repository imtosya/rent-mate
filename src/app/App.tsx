import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { LoginRegisterModal } from './components/LoginRegisterModal';
import { Property, Filters, ChatMessage, Conversation, Notification } from './types';
import { Plus } from 'lucide-react';
import {
  authApi, listingsApi, favoritesApi, messagesApi, notificationsApi,
  ApiListing, ApiConversation, ApiChatMessage, ApiNotification, ApiUser
} from '../api/api';

function apiListingToProperty(l: ApiListing): Property {
  return {
    id:              l.id,
    title:           l.title,
    description:     l.description,
    price:           l.price,
    location:        l.location,
    image:           l.image,
    rating:          l.rating,
    rooms:           l.rooms,
    roommates:       l.roommates,
    type:            l.type as Property['type'],
    typeRu:          l.typeRu,
    petFriendly:     l.petFriendly,
    genderPreference: l.genderPreference as Property['genderPreference'],
    amenities:       l.amenities,
    gallery:         l.gallery,
    reviews:         (l.reviews || []).map(r => ({
      id:      r.id,
      rating:  r.rating,
      comment: r.comment,
      date:    r.date,
      user:    r.user,
    })),
    owner: {
      id:       l.owner.id,
      name:     l.owner.name,
      avatar:   l.owner.avatar,
      rating:   l.owner.rating,
      verified: l.owner.verified,
      bio:      l.owner.bio,
      phone:    l.owner.phone,
    },
    ownerId: l.ownerId,
  };
}

function apiConversationToConversation(c: ApiConversation): Conversation {
  return {
    id:           c.id,
    participants: c.participants,
    propertyId:   c.propertyId,
    unreadCount:  c.unreadCount,
    lastMessage:  c.lastMessage ? apiMessageToChatMessage(c.lastMessage) : undefined,
    otherUser:    (c as any).otherUser,
  } as any;
}

function apiMessageToChatMessage(m: ApiChatMessage): ChatMessage {
  return {
    id:             m.id,
    conversationId: m.conversationId,
    senderId:       m.senderId,
    receiverId:     m.receiverId,
    text:           m.text,
    timestamp:      typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString(),
    read:           m.read,
    propertyId:     m.propertyId,
  };
}

function apiNotificationToNotification(n: ApiNotification): Notification {
  return {
    id:         n.id,
    title:      n.title,
    message:    n.message,
    timestamp:  n.timestamp,
    read:       n.read,
    type:       n.type as Notification['type'],
    targetType: n.targetType as Notification['targetType'],
    targetId:   n.targetId,
    propertyId: n.propertyId,
    userId:     n.userId,
  };
}

function apiUserToCurrentUser(u: ApiUser) {
  return {
    id:       u.id,
    name:     u.name,
    email:    u.email,
    phone:    u.phone,
    avatar:   u.avatar,
    rating:   u.rating,
    verified: u.verified,
  };
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  verified: boolean;
  joinDate?: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn]         = useState(false);
  const [currentUser, setCurrentUser]       = useState<CurrentUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentView, setCurrentView]       = useState('home');
  const [searchQuery, setSearchQuery]       = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [filters, setFilters]               = useState<Filters>({ priceRange: [0, 100000] });
  const [favoriteIds, setFavoriteIds]       = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen]     = useState(false);
  const [isChatOpen, setIsChatOpen]         = useState(false);
  const [isListPropertyOpen, setIsListPropertyOpen] = useState(false);
  const [selectedProperty, setSelectedProperty]     = useState<Property | null>(null);
  const [chatProperty, setChatProperty]             = useState<Property | null>(null);
  const [editingProperty, setEditingProperty]       = useState<Property | null>(null);
  const [messageInitialUserId, setMessageInitialUserId] = useState<string | undefined>(undefined);

  const [properties, setProperties]           = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [propertiesTotal, setPropertiesTotal] = useState(0);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages]   = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    authApi.me()
        .then(({ user }) => {
          setCurrentUser(apiUserToCurrentUser(user));
          setIsLoggedIn(true);
          return favoritesApi.getIds();
        })
        .then(({ ids }) => {
          setFavoriteIds(new Set(ids));
        })
        .catch(() => {});
  }, []);

  const loadListings = useCallback(async () => {
    setPropertiesLoading(true);
    try {
      const { listings, pagination } = await listingsApi.getAll({
        search:   searchQuery || undefined,
        city:     searchLocation || undefined,
        minPrice: filters.priceRange?.[0] || undefined,
        maxPrice: filters.priceRange?.[1] !== 100000 ? filters.priceRange?.[1] : undefined,
        rooms:    filters.rooms || undefined,
        type:     filters.type || undefined,
        petFriendly: filters.petFriendly || undefined,
        sort:     'newest',
        limit:    50,
      });
      setProperties(listings.map(apiListingToProperty));
      setPropertiesTotal(pagination.total);
    } catch (err) {
      console.error('Ошибка загрузки объявлений:', err);
    } finally {
      setPropertiesLoading(false);
    }
  }, [searchQuery, searchLocation, filters]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    if (!isLoggedIn) return;
    notificationsApi.getAll()
        .then(({ notifications: ns }) => setNotifications(ns.map(apiNotificationToNotification)))
        .catch(console.error);
    messagesApi.getConversations()
        .then(({ conversations: cs }) => setConversations(cs.map(apiConversationToConversation)))
        .catch(console.error);
  }, [isLoggedIn]);

  const totalUnreadMessages = useMemo(
      () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
      [conversations]
  );
  const unreadNotifications = useMemo(
      () => notifications.filter(n => !n.read).length,
      [notifications]
  );

  const favoriteProperties = useMemo(
      () => properties.filter(p => favoriteIds.has(p.id)),
      [properties, favoriteIds]
  );

  const userProperties = useMemo(
      () => currentUser ? properties.filter(p => p.ownerId === currentUser.id) : [],
      [properties, currentUser]
  );

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (filters.rating && p.rating < filters.rating) return false;
      if (filters.genderPreference && filters.genderPreference !== 'any' && p.genderPreference !== filters.genderPreference) return false;
      return true;
    });
  }, [properties, filters]);

  const toggleFavorite = async (propertyId: string) => {
    if (!isLoggedIn) { setIsLoginModalOpen(true); return; }
    try {
      if (favoriteIds.has(propertyId)) {
        await favoritesApi.remove(propertyId);
        setFavoriteIds(prev => { const s = new Set(prev); s.delete(propertyId); return s; });
      } else {
        await favoritesApi.add(propertyId);
        setFavoriteIds(prev => new Set([...prev, propertyId]));
      }
    } catch (err) {
      console.error('Ошибка избранного:', err);
    }
  };

  const handleViewDetails = async (property: Property) => {
    try {
      const full = await listingsApi.getById(property.id);
      setSelectedProperty(apiListingToProperty(full));
    } catch {
      setSelectedProperty(property);
    }
  };

  const handleOpenChat = (property: Property) => {
    setChatProperty(property);
    setIsChatOpen(true);
  };

  const handleAddProperty = async (formData: any) => {
    if (!currentUser) { setIsLoginModalOpen(true); return; }
    try {
      const { listing } = await listingsApi.create({
        title:            formData.title,
        description:      formData.description,
        price:            Number(formData.price),
        city:             formData.city || 'Бишкек',
        district:         formData.district,
        address:          formData.location,
        rooms:            Number(formData.rooms) || 1,
        type:             formData.type,
        listing_type:     formData.type,
        petFriendly:      formData.petFriendly,
        genderPreference: formData.genderPreference,
        amenities:        formData.amenities,
        wifi:             formData.amenities?.includes('Wi-Fi'),
        parking:          formData.amenities?.includes('Парковка'),
        image_urls:       formData.gallery || [],
      });
      setProperties(prev => [apiListingToProperty(listing), ...prev]);
      setIsListPropertyOpen(false);
    } catch (err: any) {
      alert(err.message || 'Ошибка создания объявления');
    }
  };

  const handleUpdateProperty = async (formData: any) => {
    if (!editingProperty) return;
    try {
      const { listing } = await listingsApi.update(editingProperty.id, {
        title:            formData.title,
        description:      formData.description,
        price:            Number(formData.price),
        address:          formData.location,
        rooms:            Number(formData.rooms),
        type:             formData.type,
        petFriendly:      formData.petFriendly,
        genderPreference: formData.genderPreference,
        amenities:        formData.amenities,
        wifi:             formData.amenities?.includes('Wi-Fi'),
        parking:          formData.amenities?.includes('Парковка'),
      });
      setProperties(prev => prev.map(p => p.id === listing.id ? apiListingToProperty(listing) : p));
      setEditingProperty(null);
      setIsListPropertyOpen(false);
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления');
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await listingsApi.delete(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления');
    }
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsListPropertyOpen(true);
  };

  const handleSendChatMessage = async (conversationId: string, text: string) => {
    if (!currentUser) return;
    const parts = conversationId.replace('conv_', '').split('_');
    const otherId = parts.find(id => id !== currentUser.id) || parts[1];
    try {
      const { data } = await messagesApi.send({ receiver_id: otherId, content: text });
      const msg = apiMessageToChatMessage(data);
      setChatMessages(prev => [...prev, msg]);
      setConversations(prev => prev.map(c =>
          c.id === conversationId ? { ...c, lastMessage: msg } : c
      ));
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markRead(notificationId);
      setNotifications(prev => prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkNotificationAsRead(notification.id);
    if (notification.targetType === 'chat') setCurrentView('messages');
    if (notification.targetType === 'property') {
      const prop = properties.find(p => p.id === notification.propertyId);
      if (prop) handleViewDetails(prop);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { user } = await authApi.login(email, password);
      setCurrentUser(apiUserToCurrentUser(user));
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setCurrentView('profile');
      const [{ ids }, { notifications: ns }, { conversations: cs }] = await Promise.all([
        favoritesApi.getIds(),
        notificationsApi.getAll(),
        messagesApi.getConversations(),
      ]);
      setFavoriteIds(new Set(ids));
      setNotifications(ns.map(apiNotificationToNotification));
      setConversations(cs.map(apiConversationToConversation));
    } catch (err: any) {
      alert(err.message || 'Ошибка входа');
    }
  };

  const handleRegister = async (userData: { name: string; email: string; password: string; phone: string }) => {
    try {
      const { user } = await authApi.register(userData);
      setCurrentUser(apiUserToCurrentUser(user));
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setCurrentView('profile');
    } catch (err: any) {
      alert(err.message || 'Ошибка регистрации');
    }
  };

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (_) {}
    setCurrentUser(null);
    setIsLoggedIn(false);
    setFavoriteIds(new Set());
    setConversations([]);
    setNotifications([]);
    setCurrentView('home');
  };

  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setSearchLocation(location);
    setCurrentView('home');
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
        return (
            <MessagesView
                conversations={conversations}
                messages={chatMessages}
                currentUserId={currentUser?.id || ''}
                properties={properties}
                onSendMessage={handleSendChatMessage}
                initialUserId={messageInitialUserId}
            />
        );
      case 'notifications':
        return (
            <NotificationsView
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onNotificationClick={handleNotificationClick}
            />
        );
      case 'profile':
        return isLoggedIn && currentUser ? (
            <UserProfile
                userProperties={userProperties}
                onEditProperty={handleEditProperty}
                onDeleteProperty={handleDeleteProperty}
                currentUserId={currentUser.id}
                currentUser={currentUser}
                onLogout={handleLogout}
                onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
                favoritesCount={favoriteIds.size}
                reviewsCount={0}
                joinDate={currentUser ? new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : ''}
            />
        ) : null;
      default:
        return (
            <>
              <HeroSection onSearch={handleSearch} onOpenFilters={() => setIsFilterOpen(true)} />
              <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {propertiesLoading ? 'Загрузка...' : `${filteredProperties.length} объявлений`}
                  </h2>
                  <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Фильтры
                  </button>
                </div>

                <FilterPanel
                    isOpen={isFilterOpen}
                    filters={filters}
                    onApplyFilters={(newFilters) => { setFilters(newFilters); setIsFilterOpen(false); }}
                    onClose={() => setIsFilterOpen(false)}
                />

                {propertiesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1,2,3,4,5,6].map(i => (
                          <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
                      ))}
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      <p className="text-xl">Объявлений не найдено</p>
                      <p className="mt-2">Попробуй изменить фильтры или поисковый запрос</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProperties.map(property => (
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
            onNavigate={(view) => {
              if (view === 'home') setCurrentView('home');
              if (view === 'favorites') setCurrentView('favorites');
              if (view === 'messages') { setMessageInitialUserId(undefined); setCurrentView('messages'); }
              if (view === 'notifications') setCurrentView('notifications');
              if (view === 'profile') {
                if (!isLoggedIn) setIsLoginModalOpen(true);
                else setCurrentView('profile');
              }
            }}
            notificationCount={unreadNotifications}
            messageCount={totalUnreadMessages}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onLogout={handleLogout}
        />

        <main className="pt-16">
          {renderContent()}
        </main>

        {isLoggedIn && (
            <button
                onClick={() => { setEditingProperty(null); setIsListPropertyOpen(true); }}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-700 to-green-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-medium"
            >
              <Plus className="w-5 h-5" />
              Добавить объявление
            </button>
        )}

        {selectedProperty && (
            <PropertyDetailModal
                property={selectedProperty}
                isOpen={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
                isFavorite={favoriteIds.has(selectedProperty.id)}
                onToggleFavorite={toggleFavorite}
                onOpenChat={() => handleOpenChat(selectedProperty)}
                onOpenMessage={async () => {
                  if (!currentUser) { setIsLoginModalOpen(true); return; }
                  if (selectedProperty.ownerId === currentUser.id) {
                    alert('Это ваше объявление');
                    return;
                  }
                  try {
                    await messagesApi.send({
                      receiver_id: selectedProperty.ownerId,
                      content: `Здравствуйте! Меня интересует ваше объявление "${selectedProperty.title}"`,
                      listing_id: selectedProperty.id,
                    });
                    const { conversations: cs } = await messagesApi.getConversations();
                    setConversations(cs.map(apiConversationToConversation));
                    setMessageInitialUserId(selectedProperty.ownerId);
                    setSelectedProperty(null);
                    setCurrentView('messages');
                  } catch (err: any) {
                    alert(err.message || 'Ошибка');
                  }
                }}
                currentUserId={currentUser?.id}
            />
        )}

        {isChatOpen && chatProperty && (
            <AIChatAssistant
                property={chatProperty}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                currentUser={currentUser}
            />
        )}

        <ListPropertyForm
            isOpen={isListPropertyOpen}
            onClose={() => { setIsListPropertyOpen(false); setEditingProperty(null); }}
            onSubmit={editingProperty ? handleUpdateProperty : handleAddProperty}
            editingProperty={editingProperty}
        />

        <LoginRegisterModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleLogin}
            onRegister={handleRegister}
        />
      </div>
  );
}