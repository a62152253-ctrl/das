import React, { useState } from 'react';
import { Sparkles, LogOut, Compass, Menu, X, Eye, LucideIcon } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

interface SidebarTab {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  tabs: SidebarTab[];
  activeTab: string;
  onTabChange: (id: any) => void;
  onLogout: () => void;
  onGoToSearch?: () => void;
  onPreviewProfile?: () => void;
  badge?: string;
}

export function Sidebar({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  onGoToSearch,
  onPreviewProfile,
  badge
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between bg-[#0f0f10] text-white px-5 py-4 border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight">
            LOKALNIE<span className="text-indigo-400">PRO</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
          aria-label="Otwórz menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0f0f10] text-slate-300 border-r border-white/5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } lg:z-35`}
      >
        {/* Top Header */}
        <div className="p-6 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <span className="font-black text-base tracking-tight text-white block leading-none">
                    LOKALNIE<span className="text-indigo-400">PRO</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block mt-1">
                    Panel Sterowania
                  </span>
                </div>
              </div>
            </div>

            {/* User Profile Summary */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3.5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0">
                  {title ? title.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate leading-tight">{title || 'Użytkownik'}</h4>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">{subtitle}</p>
                </div>
              </div>
              {badge && (
                <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-slate-500">Rola / Status</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {badge}
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 overflow-y-auto sidebar-scrollbar max-h-[calc(100vh-270px)] pr-1">
              {onPreviewProfile && (
                <button
                  onClick={() => {
                    onPreviewProfile();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-all text-left cursor-pointer border border-indigo-500/20"
                >
                  <Eye className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Podgląd Wizytówki</span>
                </button>
              )}

              {onGoToSearch && !onPreviewProfile && (
                <button
                  onClick={() => {
                    onGoToSearch();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.03] transition-all text-left cursor-pointer"
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Wróć do Wyszukiwarki</span>
                </button>
              )}
              
              {(onPreviewProfile || onGoToSearch) && <div className="h-px bg-white/[0.05] my-2" />}

              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/5 mt-auto space-y-2">
            <DarkModeToggle />

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Wyloguj się</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
