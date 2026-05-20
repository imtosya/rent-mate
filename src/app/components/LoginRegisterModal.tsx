import { X } from 'lucide-react';
import { useState } from 'react';

interface LoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => void;
}

export function LoginRegisterModal({ isOpen, onClose, onLogin, onRegister }: LoginRegisterModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoginMode) {
      onLogin(formData.email, formData.password);
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      onRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
    }

    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    });
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Полное имя *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ваше имя и фамилия"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+996 XXX XXX XXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Пароль *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Минимум 6 символов"
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Подтверждение пароля *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Повторите пароль"
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-[var(--emerald-950)] to-[var(--forest-green)] text-white rounded-xl hover:shadow-xl transition-all duration-300 font-medium"
            >
              {isLoginMode ? 'Войти' : 'Зарегистрироваться'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-[var(--primary)] hover:underline font-medium transition-colors"
              >
                {isLoginMode ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
