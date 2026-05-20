import { MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { Conversation, ChatMessage, Property } from '../types';
import { ChatWindow } from './ChatWindow';

interface MessagesViewProps {
  conversations: Conversation[];
  messages: ChatMessage[];
  currentUserId: string;
  properties: Property[];
  onSendMessage: (conversationId: string, text: string) => void;
}

export function MessagesView({ conversations, messages, currentUserId, properties, onSendMessage }: MessagesViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getUserById = (userId: string) => {
    // В реальном приложении это будет запрос к базе данных
    const mockUsers: { [key: string]: { name: string; avatar: string } } = {
      'owner1': { name: 'Гульмира Токтогулова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
      'owner2': { name: 'Данияр Исаков', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
      'owner3': { name: 'Анара Асанова', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400' },
      'user1': { name: 'Айгуль Асанова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
      'user2': { name: 'Бакыт Осмонов', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' },
      'user3': { name: 'Нуржан Калыбекова', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
    };
    return mockUsers[userId] || { name: 'Пользователь', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' };
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== currentUserId) || '';
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherUserId = getOtherParticipant(conv);
    const otherUser = getUserById(otherUserId);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConv
    ? messages.filter(m => m.conversationId === selectedConversation)
    : [];

  const otherUserId = selectedConv ? getOtherParticipant(selectedConv) : '';
  const otherUser = getUserById(otherUserId);
  const conversationProperty = selectedConv?.propertyId
    ? properties.find(p => p.id === selectedConv.propertyId)
    : undefined;

  if (selectedConversation && selectedConv) {
    return (
      <ChatWindow
        conversationId={selectedConversation}
        otherUserName={otherUser.name}
        otherUserAvatar={otherUser.avatar}
        messages={conversationMessages}
        currentUserId={currentUserId}
        property={conversationProperty}
        onClose={() => setSelectedConversation(null)}
        onSendMessage={(text) => onSendMessage(selectedConversation, text)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Сообщения</h1>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по диалогам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Пока нет сообщений</h2>
              <p className="text-gray-600">Начните общение с владельцами квартир!</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherUserId = getOtherParticipant(conversation);
              const otherUser = getUserById(otherUserId);
              const property = conversation.propertyId
                ? properties.find(p => p.id === conversation.propertyId)
                : undefined;

              return (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center space-x-4"
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="relative">
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.lastMessage.timestamp).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {property && (
                      <p className="text-xs text-gray-500 mb-1">{property.title}</p>
                    )}
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.text}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
