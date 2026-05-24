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
  initialUserId?: string;
}

export function MessagesView({ conversations, messages, currentUserId, properties, onSendMessage, initialUserId }: MessagesViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(() => {
    if (!initialUserId || !currentUserId) return null;
    const a = Math.min(+currentUserId, +initialUserId);
    const b = Math.max(+currentUserId, +initialUserId);
    return `conv_${a}_${b}`;
  });
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== currentUserId) || '';
  };

  const getOtherUser = (conversation: Conversation) => {
    return (conversation as any).otherUser || { name: 'Пользователь', avatar: '' };
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(conv);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConv
      ? messages.filter(m => m.conversationId === selectedConversation)
      : [];

  const otherUser = selectedConv ? getOtherUser(selectedConv) : { name: 'Пользователь', avatar: '' };
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  const otherUser = getOtherUser(conversation);
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
                          {otherUser.avatar ? (
                              <img src={otherUser.avatar} alt={otherUser.name} className="w-14 h-14 rounded-full object-cover" />
                          ) : (
                              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-800 font-bold text-xl">{otherUser.name?.[0]}</span>
                              </div>
                          )}
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
                          {property && <p className="text-xs text-gray-500 mb-1">{property.title}</p>}
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