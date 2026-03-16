import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, User, Trophy, LogOut, Home, ServerOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USE_MOCK_API } from '../types';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/ranking', label: 'Ranking', icon: Trophy },
    { path: '/profile', label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#3E2723] flex flex-col">
      {/* Header */}
      <header className="bg-[#5A3A22] text-[#F5F5F0] shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight shrink-0">
            <Coffee className="w-6 h-6 text-[#D2691E]" />
            <span className="hidden sm:inline">Coffee Tracker</span>
            <span className="sm:hidden">Coffee</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {USE_MOCK_API && (
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1 bg-orange-500/20 text-orange-200 rounded-full text-[10px] sm:text-xs font-medium border border-orange-500/30" title="Modo de Demonstração (Sem Backend)">
                <ServerOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Mock API</span>
                <span className="sm:hidden">Mock</span>
              </div>
            )}
            {user && (
              <>
                <span className="hidden sm:inline text-sm opacity-80 truncate max-w-[150px]">Olá, {user.name.split(' ')[0]}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-[#3E2723] rounded-full transition-colors shrink-0"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Body Container */}
      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col sm:flex-row relative">
        
        {/* Sidebar (Desktop) */}
        {user && (
          <aside className="hidden sm:block w-56 shrink-0 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col gap-2 mt-4">
              {navItems.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link 
                    key={path} 
                    to={path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#5A3A22] text-[#F5F5F0] shadow-md' 
                        : 'text-[#5A3A22] hover:bg-[#EFEBE9]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 w-full max-w-3xl mx-auto p-4 py-6 sm:py-8 pb-24 sm:pb-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      {user && (
        <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe z-20">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link 
                key={path} 
                to={path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-[#D2691E]' : 'text-gray-500 hover:text-[#5A3A22]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};
