import { Home, Heart, MessageCircle, Bell, User, Menu } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  notificationCount?: number;
  messageCount?: number;
}

export function Navbar({ currentView, onNavigate, notificationCount = 0, messageCount = 0 }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'favorites', label: 'Избранное', icon: Heart },
    { id: 'messages', label: 'Сообщения', icon: MessageCircle, badge: messageCount },
    { id: 'notifications', label: 'Уведомления', icon: Bell, badge: notificationCount },
    { id: 'profile', label: 'Профиль', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--emerald-950)] to-[var(--forest-green)] flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] bg-clip-text text-transparent">
              RentMate
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-[var(--accent)] hover:text-[var(--primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-[var(--accent)] text-[var(--primary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-[var(--border)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`relative w-full px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white'
                      : 'text-gray-600 hover:bg-[var(--accent)] hover:text-[var(--primary)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
