import { Bell, Check, Heart, MessageCircle, Star, Home, TrendingDown } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationsViewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'favorite':
      case 'price_drop':
        return <TrendingDown className="w-5 h-5" />;
      case 'new_listing':
        return <Heart className="w-5 h-5" />;
      default:
        return <Home className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'bg-blue-100 text-blue-600';
      case 'review':
        return 'bg-yellow-100 text-yellow-600';
      case 'price_drop':
        return 'bg-green-100 text-green-600';
      case 'favorite':
      case 'new_listing':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
        {notifications.some(n => !n.read) && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-[var(--primary)] hover:underline font-medium transition-colors"
          >
            Отметить все как прочитанные
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Нет уведомлений</h2>
            <p className="text-gray-600">Вы все проверили!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              className={`bg-white rounded-xl shadow-md border transition-all duration-300 hover:shadow-lg cursor-pointer ${
                notification.read ? 'border-gray-100' : 'border-[var(--primary)] bg-[var(--emerald-50)]'
              }`}
            >
              <div className="p-4 flex items-start space-x-4">
                <div className={`p-3 rounded-full flex-shrink-0 ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    {!notification.read && (
                      <span className="w-2.5 h-2.5 bg-[var(--primary)] rounded-full flex-shrink-0 ml-2 mt-1.5"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        className="text-xs text-[var(--primary)] hover:underline flex items-center space-x-1 transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Отметить прочитанным</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
