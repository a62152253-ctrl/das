import React, { useState } from 'react';
import { ShieldAlert, Globe, Ban, AlertTriangle, Zap, CheckCircle, Plus } from 'lucide-react';

export function AdminSecurityRadar() {
  const [blacklistedIps, setBlacklistedIps] = useState<string[]>([
    '185.220.101.4', '194.26.29.112', '45.154.255.88'
  ]);
  const [newIp, setNewIp] = useState('');

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setBlacklistedIps([...blacklistedIps, newIp.trim()]);
    setNewIp('');
  };

  const removeIp = (ip: string) => {
    setBlacklistedIps(blacklistedIps.filter(i => i !== ip));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" /> Radar Threat & Czarna Lista IP (Firewall Level)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Zarządzanie regułami blokowania adresów IP na poziomie zapory i ochrona przed atakami Brute-Force.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Czarna Lista Adresów IP</h3>
          <form onSubmit={handleAddIp} className="flex gap-2">
            <input
              type="text"
              placeholder="Wpisz IP do zablokowania..."
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:outline-none"
            />
            <button type="submit" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20">
              Zablokuj IP
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {blacklistedIps.map((ip, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{ip}</span>
                <button onClick={() => removeIp(ip)} className="text-xs font-bold text-rose-600 hover:underline">
                  Odblokuj
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Status Ochrony WAF & Anti-DDoS</h3>
          <div className="space-y-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">Rate Limiter API</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Maks. 100 żądań / min per IP</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[10px] font-black">AKTYWNY</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white">Detekcja Brute-Force Logowania</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Blokada po 5 nieudanych próbach</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 text-[10px] font-black">AKTYWNY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSecurityRadar;
