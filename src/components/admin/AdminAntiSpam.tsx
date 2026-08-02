import React, { useState } from 'react';
import { ShieldAlert, Ban, AlertTriangle, CheckCircle, Plus, Trash2, Filter, Zap } from 'lucide-react';

export function AdminAntiSpam() {
  const [forbiddenKeywords, setForbiddenKeywords] = useState<string[]>([
    'kasyno', 'krypto gwarantowany zysk', 'pożyczka bez bik', 'viagra', 'tanie leki'
  ]);
  const [newKeyword, setNewKeyword] = useState('');
  const [spamLogs, setSpamLogs] = useState<any[]>([
    { id: 's1', time: '19:40', ip: '185.220.101.4', keyword: 'pożyczka bez bik', action: 'Zablokowano publikację', content: 'Super okazja pożyczka bez bik bez zgody małżonka...' }
  ]);

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setForbiddenKeywords([...forbiddenKeywords, newKeyword.trim().toLowerCase()]);
    setNewKeyword('');
  };

  const deleteKeyword = (kw: string) => {
    setForbiddenKeywords(forbiddenKeywords.filter(k => k !== kw));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Tarcza Anti-Spam & Filtry Słów Zabronionych
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Automatyczna moderacja treści, filtry NLP oraz rejestr zablokowanych prób publikacji spamu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keywords manager */}
        <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Czarna Lista Słów Kluczowych</h3>
          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <input
              type="text"
              placeholder="Dodaj słowo zabronione..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
            />
            <button type="submit" className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20">
              Dodaj
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {forbiddenKeywords.map((kw, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl">
                <span>{kw}</span>
                <button type="button" onClick={() => deleteKeyword(kw)} className="font-bold hover:text-rose-900">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Spam Detection Logs */}
        <div className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ostatnie Zablokowane Proby Spamu</h3>
          <div className="space-y-2">
            {spamLogs.map(log => (
              <div key={log.id} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-400 font-mono">{log.time} | IP: {log.ip}</span>
                  <span className="text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">{log.action}</span>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-1">"{log.content}"</p>
                <span className="text-[10px] font-mono text-slate-400">Wykryte słowo: <b className="text-rose-500">{log.keyword}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAntiSpam;
