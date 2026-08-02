import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { Sparkles, LogOut, User, Building2, ShieldAlert, Compass, Eye } from 'lucide-react';
import { AuthView } from '@/types';
import { NotificationsPopover } from './NotificationsPopover';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface Props {
  currentView: AuthView;
  onNavigate: (view: AuthView, id?: string) => void;
}

export function Navbar({ currentView, onNavigate }: Props) {
  const { user, profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  const handleLogoClick = () => {
    if (!user) {
      onNavigate('home');
      return;
    }
    if (profile?.role === 'admin') {
      onNavigate('dashboard-admin');
    } else if (profile?.role === 'firma') {
      onNavigate('dashboard-company');
    } else {
      onNavigate('home');
    }
  };

  return (
    <nav className="backdrop-blur-md bg-slate-950/90 border-b border-white/[0.08] text-white sticky top-0 z-50 shadow-lg shadow-black/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={handleLogoClick} 
          className="flex items-center space-x-2.5 focus:outline-none cursor-pointer group"
          title="Strona Główna Panelu"
        >
          <div className="relative">
            <div className="w-8.5 h-8.5 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-base tracking-tight bg-clip-text bg-gradient-to-r from-white to-slate-200 block leading-none">
              LOKALNIE<span className="text-indigo-400">PRO</span>
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 block mt-0.5">
              {profile?.role === 'firma' ? 'Tryb Firmowy' : profile?.role === 'admin' ? 'Panel Admina' : 'Wyszukiwarka Usług'}
            </span>
          </div>
        </button>

        {/* Navigation Items & User Controls */}
        <div className="flex items-center space-x-2">
          {/* Role specific navigation actions */}
          {profile?.role === 'firma' ? (
            <button 
              onClick={() => onNavigate('company-profile', user?.uid)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'company-profile'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
              title="Zobacz podgląd swojej wizytówki w oczach klientów"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Podgląd Wizytówki</span>
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'home' || currentView === 'search' 
                  ? 'bg-white/10 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wyszukiwarka</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {user ? (
            <>
              {/* Real-time Notifications Popover */}
              <NotificationsPopover onNavigate={(v, id) => onNavigate(v as AuthView, id)} />

              {profile?.role === 'admin' ? (
                <button 
                  onClick={() => onNavigate('dashboard-admin')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold border border-rose-500/20 text-rose-300 transition-all shadow-xs cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Panel Admina</span>
                </button>
              ) : profile?.role === 'firma' ? (
                <button 
                  onClick={() => onNavigate('dashboard-company')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-semibold border border-indigo-500/20 text-indigo-300 transition-all shadow-xs cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Panel Firmy</span>
                </button>
              ) : (
                <button 
                  onClick={() => onNavigate('dashboard-client')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold border border-white/5 text-slate-200 transition-all shadow-xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Mój Profil & Rezerwacje</span>
                </button>
              )}

              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all border border-white/5 cursor-pointer"
                title="Wyloguj się"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
            >
              <span>Zaloguj się</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
