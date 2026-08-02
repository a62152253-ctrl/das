import React, { useState } from 'react';
import { Bell, Send, Megaphone, AlertCircle, CheckCircle, Radio } from 'lucide-react';

export function AdminNotificationCenter() {
  const [targetGroup, setTargetGroup] = useState<'all' | 'firmy' | 'clients'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [bannerText, setBannerText] = useState('Planowane prace konserwacyjne w niedzielę w godz. 02:00 - 04:00.');

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    alert(`Wysłano powiadomienie Push do grupy: ${targetGroup.toUpperCase()}`);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-600" /> Centrum Komunikatów i Powiadomień Masowych
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Wysyłanie komunikatów systemowych PUSH oraz aktywacja globalnego banera informacyjnego na portalu.
        </p>
      </div>

      {/* Emergency Global Banner Control */}
      <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Globalny Baner Awaryjny na Stronie Główniej</h3>
          </div>
          <button
            onClick={() => setBannerActive(!bannerActive)}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all ${
              bannerActive 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {bannerActive ? 'BANER WŁĄCZONY' : 'BANER WYŁĄCZONY'}
          </button>
        </div>

        <input
          type="text"
          value={bannerText}
          onChange={e => setBannerText(e.target.value)}
          className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
        />
      </div>

      {/* Broadcast Push Notification Form */}
      <form onSubmit={handleSendNotification} className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Wysyłanie Powiadomienia PUSH</h3>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Grupa Docelowa</label>
          <div className="flex gap-2">
            {(['all', 'firmy', 'clients'] as const).map(group => (
              <button
                key={group}
                type="button"
                onClick={() => setTargetGroup(group)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  targetGroup === group 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {group === 'all' ? 'Wszyscy' : group}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Tytuł Powiadomienia</label>
          <input
            type="text"
            placeholder="np. Nowa funkcja w portalu!"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Treść Komunikatu</label>
          <textarea
            rows={3}
            placeholder="Wpisz treść wiadomości PUSH..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
          />
        </div>

        <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2">
          <Send className="w-4 h-4" /> Wyślij Komunikat PUSH
        </button>
      </form>
    </div>
  );
}

export default AdminNotificationCenter;
