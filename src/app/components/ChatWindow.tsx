import { X, Send, ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Property } from '../types';

interface ChatWindowProps {
  conversationId: string;
  otherUserName: string;
  otherUserAvatar: string;
  messages: ChatMessage[];
  currentUserId: string;
  property?: Property;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export function ChatWindow({
  conversationId,
  otherUserName,
  otherUserAvatar,
  messages,
  currentUserId,
  property,
  onClose,
  onSendMessage,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] flex flex-col">
        <div className="bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img
              src={otherUserAvatar}
              alt={otherUserName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
            />
            <div>
              <h3 className="font-semibold">{otherUserName}</h3>
              {property && (
                <p className="text-xs text-white/80">{property.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Начните разговор!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[70%] ${
                      isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <img
                      src={isCurrentUser ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400' : otherUserAvatar}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                        }`}
                      >
                        {message.text}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block px-2">
                        {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {property && (
          <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={property.image}
                alt={property.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{property.title}</p>
                <p className="text-xs text-gray-600">{property.price.toLocaleString('ru-RU')} сом/мес</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Введите сообщение..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
