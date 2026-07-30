import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Sparkles, LogOut, User, Building2, ShieldAlert } from 'lucide-react';
import { AuthView } from '../types';

interface Props {
  currentView: AuthView;
  onNavigate: (view: AuthView) => void;
}

export function Navbar({ currentView, onNavigate }: Props) {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center space-x-2 focus:outline-none cursor-pointer group"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight bg-clip-text bg-gradient-to-r from-white to-slate-300">
            LOKALNIE<span className="text-blue-400">PRO</span>
          </span>
        </button>

        {/* Navigation Items */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm font-semibold tracking-wide hover:text-blue-400 transition-colors ${currentView === 'home' || currentView === 'search' ? 'text-blue-400' : 'text-slate-300'}`}
          >
            Wyszukiwarka
          </button>

          {user ? (
            <>
              {profile?.role === 'admin' ? (
                <button 
                  onClick={() => onNavigate('dashboard-admin')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-sm font-bold border border-red-900/50 text-red-200 transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Panel Admina</span>
                </button>
              ) : profile?.role === 'firma' ? (
                <button 
                  onClick={() => onNavigate('dashboard-company')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold border border-slate-700 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Panel Firmy</span>
                </button>
              ) : (
                <button 
                  onClick={() => onNavigate('dashboard-client')}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold border border-slate-700 transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Mój Profil</span>
                </button>
              )}

              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                title="Wyloguj się"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-bold text-white transition-colors shadow-lg shadow-blue-500/20"
            >
              <span>Zaloguj się</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

