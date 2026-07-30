import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Bookmark, History, MessageSquare, Bell, User as UserIcon, Settings, Send, Check } from 'lucide-react';
import { SavedSearch, SearchLog, Message, Notification } from '../types';
import { useLocalStorage } from '../lib/useLocalStorage';

export function ClientDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'messages' | 'notifications'>('favorites');

  // Read from local storage
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>('lokalnie_saved_searches', []);
  const [searchLogs, setSearchLogs] = useLocalStorage<SearchLog[]>('lokalnie_search_logs', []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      senderId: 'comp_1',
      receiverId: user?.uid || '',
      senderName: 'Salon Fryzjerski Anna',
      content: 'Dzień dobry! Tak, mamy wolny termin na strzyżenie męskie w najbliższy piątek o 15:30. Zapraszamy.',
      timestamp: 'Dzisiaj, 11:05',
      read: false
    },
    {
      id: 'm2',
      senderId: user?.uid || '',
      receiverId: 'comp_1',
      senderName: profile?.name || 'Klient',
      content: 'Super, dziękuję za informację. Chciałbym zarezerwować ten termin.',
      timestamp: 'Dzisiaj, 11:20',
      read: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      userId: user?.uid || '',
      title: 'Nowa wiadomość',
      content: 'Otrzymałeś nową odpowiedź od Salon Fryzjerski Anna.',
      read: false,
      createdAt: 'Dzisiaj, 11:05',
      type: 'message'
    },
    {
      id: 'n2',
      userId: user?.uid || '',
      title: 'Wygasająca promocja',
      content: 'Promocja "-20% na koloryzację w środy" kończy się za 3 dni. Zarezerwuj wizytę już teraz!',
      read: true,
      createdAt: 'Wczoraj, 09:00',
      type: 'promotion'
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Math.random().toString(),
      senderId: user?.uid || 'user',
      receiverId: 'comp_1',
      senderName: profile?.name || 'Klient',
      content: newMessage,
      timestamp: 'Przed chwilą',
      read: true
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Sidebar profile info & tabs navigation */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
              <UserIcon className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{profile?.name || 'Mieszkaniec'}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Konto Mieszkańca</p>
            <p className="text-slate-500 text-sm mt-3 font-medium truncate">{user?.email}</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-2 space-y-1">
              <button 
                onClick={() => setActiveTab('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'favorites' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-5 h-5 shrink-0" />
                <span>Zapisane wyszukiwania</span>
              </button>

              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <History className="w-5 h-5 shrink-0" />
                <span>Historia wyszukiwań</span>
              </button>

              <button 
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'messages' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 shrink-0" />
                  <span>Wiadomości</span>
                </div>
                <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-full">1</span>
              </button>

              <button 
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 shrink-0" />
                  <span>Powiadomienia</span>
                </div>
                {notifications.some(n => !n.read) && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Content view based on activeTab */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          {activeTab === 'favorites' && (
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Obserwowane i Zapisane</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Zapisane wyszukiwania</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedSearches.length > 0 ? savedSearches.map(search => (
                      <div key={search.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100/70 transition-colors">
                        <div>
                          <p className="font-extrabold text-slate-950 text-base">{search.query}</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">Dodano: {new Date(search.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline">Szukaj ponownie</button>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 font-medium col-span-2">Nie masz żadnych zapisanych wyszukiwań.</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ulubione firmy</h4>
                  <div className="bg-slate-50 p-6 rounded-2xl text-center text-slate-400 border border-dashed border-slate-200">
                    Brak ulubionych firm. Kliknij gwiazdkę przy dowolnej firmie w wynikach wyszukiwania, by dodać ją do tej listy.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Historia wyszukiwań</h3>
              <div className="space-y-4">
                {searchLogs.length > 0 ? searchLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-bold text-slate-900">{log.query}</span>
                        <span className="text-xs text-slate-400 font-semibold ml-2">({log.city})</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{log.timestamp}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 font-medium">Brak historii wyszukiwań.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col h-[500px]">
              <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Salon Fryzjerski Anna</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Odpowiada zazwyczaj w ciągu godziny</p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar mb-4">
                {messages.map(msg => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-4 rounded-2xl ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                        <span className={`text-[10px] block mt-1.5 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input formulation */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napisz wiadomość..."
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-medium"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Powiadomienia</h3>
                <button 
                  onClick={markAllNotificationsAsRead}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Oznacz jako przeczytane
                </button>
              </div>

              <div className="space-y-4">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 rounded-2xl border transition-colors flex items-start gap-4 ${
                      notif.read ? 'bg-slate-50/50 border-slate-100' : 'bg-blue-50/20 border-blue-100'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${notif.read ? 'bg-slate-300' : 'bg-blue-600'}`} />
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-900 text-sm">{notif.title}</h4>
                      <p className="text-slate-600 text-sm mt-1 font-medium">{notif.content}</p>
                      <span className="text-[10px] text-slate-400 font-medium block mt-2">{notif.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
