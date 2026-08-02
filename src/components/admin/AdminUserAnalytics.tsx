import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, Users, Activity, MapPin, Smartphone, AlertTriangle, Search, Filter, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminUserAnalytics() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    async function fetchAnalyticsData() {
      setLoading(true);
      try {
        const { getFirebaseDb } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const db = await getFirebaseDb();
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(list);
      } catch (err) {
        console.error("Error fetching user analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalyticsData();
  }, []);

  const highRiskCount = users.filter(u => (u.trustScore ?? 100) < 50 || u.violationsCount > 2).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Analiza Behawioralna i Profilowanie Ryzyka
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Zaawansowana detekcja anomalii, ocena zaufania i profilowanie sesji użytkowników.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold">
            Algorytm AI TrustScore v2.4
          </span>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Przeanalizowanych Kont</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{users.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flaga Podwyższonego Ryzyka</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{highRiskCount}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Średni Wskaźnik Zaufania</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + (u.trustScore ?? 100), 0) / users.length) : 100}%
          </p>
        </div>
      </div>

      {/* Analytics User List */}
      <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-4 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ocena Zaufania i Wskaźniki Anomalii</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 font-bold">Brak użytkowników do analizy.</p>
        ) : (
          <div className="space-y-2">
            {users.map(u => {
              const score = u.trustScore ?? 100;
              const isRisk = score < 60 || (u.violationsCount && u.violationsCount > 0);
              return (
                <div key={u.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{u.displayName || u.email}</span>
                      {isRisk ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-600">RYZYKO</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-600">BEZPIECZNY</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{u.email || u.id}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 block">Trust Score</span>
                      <span className={`text-sm font-black ${score > 80 ? 'text-emerald-600' : 'text-rose-600'}`}>{score}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUserAnalytics;
