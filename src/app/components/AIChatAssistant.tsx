import { X, Send, Bot, User as UserIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Message, Property } from '../types';

interface AIChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  property?: Property;
  onSendToOwner?: (message: string, propertyId: string, ownerId: string) => void;
}

const commonQuestions = [
  { question: 'Квартира свободна?', answer: 'Да, эта квартира сейчас свободна для аренды! Хотите договориться о просмотре?' },
  { question: 'Wi-Fi включен?', answer: 'Да! Высокоскоростной Wi-Fi включен в ежемесячную арендную плату без дополнительной платы.' },
  { question: 'Можно с животными?', answer: 'Политика в отношении животных может варьироваться. Пожалуйста, проверьте раздел удобств или свяжитесь с владельцем напрямую.' },
  { question: 'Какой размер депозита?', answer: 'Залог обычно составляет арендную плату за один месяц. Окончательные условия можно обсудить с владельцем.' },
  { question: 'Сколько человек живет?', answer: 'В настоящее время в квартире проживают соседи. Проверьте детали объявления для точных цифр.' },
  { question: 'Коммунальные услуги включены?', answer: 'Базовые коммунальные услуги, такие как вода и вывоз мусора, включены. Электричество и интернет могут варьироваться - уточните у владельца.' },
  { question: 'Какие правила дома?', answer: 'Общие правила включают тихие часы после 22:00, запрет на курение в помещении и совместную уборку. Конкретные правила можно обсудить с соседями.' },
  { question: 'Когда можно заселиться?', answer: 'Даты заселения гибкие и могут быть согласованы с владельцем. Свяжитесь с ним, чтобы обсудить удобное для вас время.' },
];

export function AIChatAssistant({ isOpen, onClose, property, onSendToOwner }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Здравствуйте! Я ваш AI-помощник. Я могу помочь ответить на вопросы о ${property?.title || 'этой квартире'}. Что бы вы хотели узнать?`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickQuestion = (question: string, answer: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: answer,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage, aiMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    const matchedQuestion = commonQuestions.find(q =>
      inputText.toLowerCase().includes(q.question.toLowerCase().split(' ')[1]) ||
      inputText.toLowerCase().includes(q.question.toLowerCase().split(' ')[2])
    );

    let aiResponse: string;
    let forwardToOwner = false;

    if (matchedQuestion) {
      aiResponse = matchedQuestion.answer;
    } else {
      // AI не знает ответ - перенаправляем владельцу
      aiResponse = "Я не могу точно ответить на ваш вопрос. Ваше сообщение было автоматически отправлено владельцу квартиры. Он свяжется с вами в ближайшее время через раздел 'Сообщения'. 📨";
      forwardToOwner = true;
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage, aiMessage]);

    // Отправляем сообщение владельцу если AI не знает ответ
    if (forwardToOwner && property && onSendToOwner) {
      onSendToOwner(inputText, property.id, property.owner.id);
    }

    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">AI Assistant</h3>
              <p className="text-xs text-white/80">Always here to help</p>
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-[var(--emerald-950)] to-[var(--forest-green)] text-white'
                      : 'bg-white border-2 border-[var(--primary)] text-[var(--primary)]'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <UserIcon className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Быстрые вопросы:</p>
            <div className="flex flex-wrap gap-2">
              {commonQuestions.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q.question, q.answer)}
                  className="px-3 py-1.5 text-xs bg-[var(--accent)] text-[var(--primary)] rounded-full hover:bg-[var(--primary)] hover:text-white transition-all duration-300"
                >
                  {q.question}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Введите ваш вопрос..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              onClick={handleSendMessage}
              className="p-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
