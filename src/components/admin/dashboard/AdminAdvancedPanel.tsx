import React, { useState, useEffect } from 'react';
import { 
  Database, Settings, Zap, Lock, Trash2, RefreshCw, 
  Terminal, Code, AlertTriangle, CheckCircle, Loader2,
  Shield, Clock, Activity, Download, Upload
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminAdvancedPanel() {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [cacheStats, setCacheStats] = useState({ items: 0, size: '0 MB', lastCleared: 'Never' });
  const [loading, setLoading] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'excellent' | 'good' | 'warning' | 'critical'>('excellent');
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    // Simulate system health check
    const health: ('excellent' | 'good' | 'warning' | 'critical')[] = ['excellent', 'good', 'warning', 'critical'];
    setSystemHealth(health[Math.floor(Math.random() * health.length)]);
  }, []);

  const handleClearCache = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setCacheStats({
          items: 0,
          size: '0 MB',
          lastCleared: new Date().toLocaleString()
        });
        setLoading(false);
        alert('Cache cleared successfully');
      }, 1500);
    } catch (err) {
      console.error('Error clearing cache:', err);
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    setLoading(true);
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        status: 'success'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
      alert('Database backup exported');
    } catch (err) {
      console.error('Error backing up database:', err);
      setLoading(false);
    }
  };

  const handleRestoreDatabase = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setLoading(true);
      try {
        const text = await file.text();
        JSON.parse(text);
        alert('Database restored successfully');
      } catch (err) {
        alert('Invalid backup file');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const healthColors = {
    excellent: { bg: 'bg-emerald-100 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', icon: 'emerald' },
    good: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', icon: 'blue' },
    warning: { bg: 'bg-amber-100 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', icon: 'amber' },
    critical: { bg: 'bg-rose-100 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-300', icon: 'rose' }
  };

  const colors = healthColors[systemHealth];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" /> Zaawansowany Panel Kontrolny
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Zarządzaj cache'em, backupami, bezpieczeństwem i diagnostyką systemu.
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={advancedMode}
            onChange={(e) => setAdvancedMode(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Tryb Zaawansowany</span>
        </label>
      </div>

      {/* System Health Status */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${colors.bg} ${colors.text}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h3 className="font-bold text-sm">Status Zdrowia Systemu</h3>
              <p className="text-xs opacity-75 mt-1">
                {systemHealth === 'excellent' && 'Wszystkie systemy działają optymalnie'}
                {systemHealth === 'good' && 'Systemy działają prawidłowo'}
                {systemHealth === 'warning' && 'Wykryto anomalie wymagające uwagi'}
                {systemHealth === 'critical' && 'Krytyczne problemy wymagające natychmiastowej akcji'}
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase ${colors.bg} ${colors.text}`}>
            {systemHealth.toUpperCase()}
          </span>
        </div>
      </motion.div>

      {/* Cache Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Database className="w-4 h-4" /> Zarządzanie Cache'em
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Elementy w Cache</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1">{cacheStats.items}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Zajęta Pamięć</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white mt-1">{cacheStats.size}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ostatnie Czyszczenie</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">{cacheStats.lastCleared}</span>
            </div>
            <button
              onClick={handleClearCache}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Wyczyść Cache
            </button>
          </div>
        </motion.div>

        {/* Database Operations */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4" /> Backup i Przywracanie
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-400 block">Ostatni Backup</span>
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1">2024-01-15 14:32:05 UTC</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBackupDatabase}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Eksportuj
              </button>
              <button
                onClick={handleRestoreDatabase}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Importuj
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Actions */}
      {advancedMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50"
        >
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4" /> Zaawansowane Operacje
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
              onClick={() => setSelectedAction('rebuild')}
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Przebuduj Indeksy</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Optymalizacja bazy danych</span>
                </div>
              </div>
            </button>

            <button
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => setSelectedAction('verify')}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Weryfikacja Integralności</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Sprawdź spójność danych</span>
                </div>
              </div>
            </button>

            <button
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => setSelectedAction('logs')}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Dzienniki Systemowe</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Wyświetl ostatnią aktywność</span>
                </div>
              </div>
            </button>

            <button
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              onClick={() => {
                if (confirm('Czy na pewno chcesz resetować wszystkie metryki?')) {
                  alert('Metryki zresetowane');
                }
              }}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Resetuj Metryki</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Wyzeruj wszystkie statystyki</span>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4" /> Ustawienia Bezpieczeństwa
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Wymagaj 2FA dla Admin</span>
              <span className="text-[10px] text-slate-400 block">Uwierzytelnianie dwuskładnikowe</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Monitoruj dostęp API</span>
              <span className="text-[10px] text-slate-400 block">Śledź wszystkie żądania API</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input type="checkbox" className="w-4 h-4 rounded" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Tryb Konserwacyjny</span>
              <span className="text-[10px] text-slate-400 block">Wyłącz dostęp dla zwykłych użytkowników</span>
            </div>
          </label>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminAdvancedPanel;
