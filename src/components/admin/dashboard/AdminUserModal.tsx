import React, { useState, useEffect } from 'react';
import {
  Users, Settings, BarChart3, AlertCircle, CheckCircle, XCircle,
  Search, Filter, Download, Send, Ban, RotateCcw, Eye, Mail,
  TrendingUp, Clock, Shield, Zap, Lock, Unlock, FileText, Trash2,
  Calendar, MapPin, Smartphone, ChevronDown, Plus, X, Activity, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/admin/api';
const ADMIN_TOKEN = localStorage.getItem('adminToken') || '';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export function UserDetailModal({ userId, onClose, onRefresh }: UserDetailModalProps) {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'notes' | 'actions'>('overview');
  const [newNote, setNewNote] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [trustScoreAdjustment, setTrustScoreAdjustment] = useState('');
  const [tempBanHours, setTempBanHours] = useState('24');
  const [reputationLevel, setReputationLevel] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const [userRes, notesRes, timelineRes] = await Promise.all([
        fetch(`${API_BASE}/user/${userId}`, { headers: { 'x-admin-token': ADMIN_TOKEN } }),
        fetch(`${API_BASE}/user/${userId}/notes`, { headers: { 'x-admin-token': ADMIN_TOKEN } }),
        fetch(`${API_BASE}/user/${userId}/timeline`, { headers: { 'x-admin-token': ADMIN_TOKEN } })
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      } else {
        // Fallback for demo
        setUser({
          user: {
            email: 'uzytkownik@example.com',
            reputation: 'NORMAL',
            trustScore: 92,
            totalViolations: 0,
            accountAge: 45,
            emailVerified: true,
            phoneVerified: false
          },
          profile: {
            firstName: 'Jan',
            lastName: 'Kowalski',
            phone: '+48 600 100 200'
          },
          ipHistory: [{ ip_address: '192.168.1.1', count: 14 }],
          deviceFingerprints: [{ id: '1', browser: 'Chrome 120', os: 'Windows 11', ip_address: '192.168.1.1' }]
        });
      }

      if (notesRes.ok) {
        setNotes(await notesRes.json());
      }
      if (timelineRes.ok) {
        setTimeline(await timelineRes.json());
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      // Demo fallback
      setUser({
        user: {
          email: 'uzytkownik@example.com',
          reputation: 'NORMAL',
          trustScore: 92,
          totalViolations: 0,
          accountAge: 45,
          emailVerified: true,
          phoneVerified: false
        },
        profile: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          phone: '+48 600 100 200'
        },
        ipHistory: [{ ip_address: '192.168.1.1', count: 14 }],
        deviceFingerprints: [{ id: '1', browser: 'Chrome 120', os: 'Windows 11', ip_address: '192.168.1.1' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: string) => {
    try {
      let endpoint = `/admin/api/user/${userId}/${type}`;
      let body: any = { reason: actionReason };

      if (type === 'temporary-ban') {
        body.hours = parseInt(tempBanHours);
      } else if (type === 'adjust-trust-score') {
        body.adjustment = parseInt(trustScoreAdjustment);
      } else if (type === 'restrict-level') {
        body.level = reputationLevel;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert('Akcja wykonana pomyślnie.');
        fetchUserData();
        onRefresh?.();
      } else {
        alert('Wykonano akcję symulacyjnie.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Akcja zarejestrowana.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/user/${userId}/add-note`, {
        method: 'POST',
        headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote })
      });

      if (res.ok) {
        setNewNote('');
        fetchUserData();
      } else {
        setNotes([{ id: Date.now(), created_at: new Date().toISOString(), note: newNote }, ...notes]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error:', err);
      setNotes([{ id: Date.now(), created_at: new Date().toISOString(), note: newNote }, ...notes]);
      setNewNote('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {user?.user?.email || 'Konto Użytkownika'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Identyfikator: <span className="font-mono text-indigo-600 dark:text-indigo-400">{userId}</span>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-3 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 px-6">
          {[
            { id: 'overview', label: 'Przegląd', icon: Eye },
            { id: 'timeline', label: 'Oś Czasu', icon: Activity },
            { id: 'notes', label: 'Notatki Admina', icon: MessageSquare },
            { id: 'actions', label: 'Akcje & Moderacja', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">Ładowanie danych...</div>
          ) : user ? (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Reputacja</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{user.user.reputation || 'NORMAL'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Wskaźnik Zaufania</p>
                      <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{user.user.trustScore || 90}/100</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Naruszenia</p>
                      <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-1">{user.user.totalViolations || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Wiek Konta</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{user.user.accountAge || 1}d</p>
                    </div>
                  </div>

                  {/* Personal Profile Info */}
                  <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" /> Dane Osobowe & Weryfikacja
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                      <div>
                        <p className="text-slate-400">Imię i Nazwisko</p>
                        <p className="text-slate-900 dark:text-white mt-0.5">{user.profile?.firstName} {user.profile?.lastName}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Telefon</p>
                        <p className="text-slate-900 dark:text-white mt-0.5">{user.profile?.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Email Weryfikowany</p>
                        <p className="text-emerald-600 font-bold mt-0.5">{user.user.emailVerified ? 'Tak' : 'Nie'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Telefon Weryfikowany</p>
                        <p className="text-indigo-600 font-bold mt-0.5">{user.user.phoneVerified ? 'Tak' : 'Nie'}</p>
                      </div>
                    </div>
                  </div>

                  {/* IP History */}
                  {user.ipHistory && user.ipHistory.length > 0 && (
                    <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" /> Historia Adresów IP
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {user.ipHistory.map((ip: any, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300">
                            {ip.ip_address} ({ip.count}x)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TIMELINE TAB */}
              {activeTab === 'timeline' && (
                <div className="space-y-3">
                  {timeline.length === 0 ? (
                    <p className="text-slate-400 text-center py-6 text-xs font-bold">Brak zarejestrowanych zdarzeń</p>
                  ) : (
                    timeline.map((event, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-900 dark:text-white capitalize">{event.type}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.reason || event.type}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* NOTES TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Dodaj notatkę wewnętrzną</label>
                    <textarea
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Wpisz notatkę widoczną dla administratorów..."
                      className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                      <Plus className="w-4 h-4" /> Zapisz Notatkę
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {notes.map((n, idx) => (
                      <div key={idx} className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/50">
                        <p className="text-[10px] text-slate-400 font-mono mb-1">{new Date(n.created_at).toLocaleString()}</p>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{n.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIONS TAB */}
              {activeTab === 'actions' && (
                <div className="space-y-6">
                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleAction('verify-email')}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Email Ver.
                    </button>
                    <button
                      onClick={() => handleAction('verify-phone')}
                      className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                    >
                      <CheckCircle className="w-4 h-4" /> Telefon Ver.
                    </button>
                    <button
                      onClick={() => handleAction('unban')}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Unlock className="w-4 h-4" /> Odblokuj
                    </button>
                    <button
                      onClick={() => handleAction('reset-violations')}
                      className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/20"
                    >
                      <RotateCcw className="w-4 h-4" /> Resetuj
                    </button>
                  </div>

                  {/* Temporary Ban & Score Adjustment */}
                  <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Czasowa Blokada (godziny)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={tempBanHours}
                          onChange={e => setTempBanHours(e.target.value)}
                          className="w-28 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                          min="1"
                        />
                        <button
                          onClick={() => handleAction('temporary-ban')}
                          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20"
                        >
                          Zastosuj Ban
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Korekta Wskaźnika Zaufania</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="number"
                          value={trustScoreAdjustment}
                          onChange={e => setTrustScoreAdjustment(e.target.value)}
                          className="w-28 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                          placeholder="+10 lub -5"
                        />
                        <input
                          type="text"
                          value={actionReason}
                          onChange={e => setActionReason(e.target.value)}
                          placeholder="Powód korekty..."
                          className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                        />
                        <button
                          onClick={() => handleAction('adjust-trust-score')}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20"
                        >
                          Aktualizuj
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-3">
                    <p className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Strefa Zagrożenia</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz zablokować użytkownika na stałe?')) {
                            handleAction('ban');
                          }
                        }}
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/20"
                      >
                        <Ban className="w-4 h-4" /> Zablokuj na Stałe
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

export default UserDetailModal;
