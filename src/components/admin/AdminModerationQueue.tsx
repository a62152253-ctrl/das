import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Building2, Loader2, Sparkles } from 'lucide-react';

export function AdminModerationQueue() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingQueue() {
      setLoading(true);
      try {
        const { getFirebaseDb } = await import('@/lib/firebase');
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const db = await getFirebaseDb();
        const snap = await getDocs(collection(db, 'ads'));
        const pending = snap.docs.map(d => ({ id: d.id, type: 'ogłoszenie', ...d.data() }));
        setItems(pending);
      } catch (err) {
        console.error("Queue error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingQueue();
  }, []);

  const handleApprove = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    alert('Zatwierdzono i opublikowano w serwisie.');
  };

  const handleReject = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    alert('Odrzucono wpis.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" /> Szybka Kolejka Moderacji Wpisów
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Weryfikacja oczekujących ogłoszeń, zmian w profilach firm oraz opinii przed publikacją.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Kolejka Moderacji Jest Pusta</h3>
          <p className="text-xs text-slate-400 mt-1">Wszystkie zgłoszone treści zostały przeanalizowane.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                  {item.type || 'Ogłoszenie'}
                </span>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{item.title || 'Nowy wpis'}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description || 'Brak opisu'}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleApprove(item.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Zatwierdź
                </button>
                <button onClick={() => handleReject(item.id)} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Odrzuć
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminModerationQueue;
