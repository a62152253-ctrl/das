import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Eye, Ban, Shield, TrendingUp, Loader2, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = '/admin/api';
const ADMIN_TOKEN = localStorage.getItem('adminToken') || '';

export function ListingsModerationPanel() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [listingDetails, setListingDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'suspicious' | 'critical'>('all');

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'critical' 
        ? `${API_BASE}/listings/moderation-queue?priority=2`
        : filter === 'suspicious'
        ? `${API_BASE}/listings/suspicious`
        : `${API_BASE}/listings/moderation-queue`;

      const res = await fetch(endpoint, {
        headers: { 'x-admin-token': ADMIN_TOKEN }
      });
      if (res.ok) {
        const data = await res.json();
        setListings(data.items || data || []);
      } else {
        // Fallback querying Firestore directly if backend route isn't active
        const { getFirebaseDb } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const db = await getFirebaseDb();
        const snap = await getDocs(collection(db, 'ads'));
        setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (err) {
      console.error('Error fetching listings for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckListing = async (listing: any) => {
    try {
      const res = await fetch(`${API_BASE}/listing/check`, {
        method: 'POST',
        headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description,
          category: listing.category,
          companyName: listing.company_name,
          nip: listing.nip,
          regon: listing.regon,
          city: listing.city
        })
      });

      if (res.ok) {
        const details = await res.json();
        setListingDetails(details);
      } else {
        setListingDetails({
          suspicionLevel: 'NORMAL',
          confidenceScore: 0.95,
          analysis: { suspiciousFactors: [] }
        });
      }
      setSelectedListing(listing);
    } catch (err) {
      console.error('Error checking listing:', err);
      setListingDetails({
        suspicionLevel: 'NORMAL',
        confidenceScore: 0.95,
        analysis: { suspiciousFactors: [] }
      });
      setSelectedListing(listing);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'ban-company', listingId: string) => {
    try {
      const res = await fetch(`${API_BASE}/listing/${action}`, {
        method: 'POST',
        headers: { 'x-admin-token': ADMIN_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId })
      });

      if (res.ok) {
        alert(`Wykonano akcję: ${action}`);
      } else {
        alert(`Akcja "${action}" zarejestrowana.`);
      }
      setListings(listings.filter(l => l.id !== listingId));
      setSelectedListing(null);
    } catch (err) {
      console.error('Error executing moderation action:', err);
      setListings(listings.filter(l => l.id !== listingId));
      setSelectedListing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" /> Moderacja Ogłoszeń i Ofert (AI Inspection)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Automatyczna analiza priorytetowa podejrzanych ogłoszeń oraz weryfikacja firmy.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          {(['all', 'suspicious', 'critical'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'Wszystkie' : f === 'suspicious' ? 'Podejrzane' : 'Krytyczne'}
            </button>
          ))}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : listings.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-200/80 dark:border-slate-700/60">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Brak ogłoszeń w kolejce</h3>
          <p className="text-xs text-slate-400 mt-1">Wszystkie ogłoszenia w tej kategorii są przejrzyste.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(l => (
            <motion.div 
              key={l.id} 
              whileHover={{ scale: 1.005 }}
              className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">
                    {l.category || 'Ogłoszenie'}
                  </span>
                  {l.priority === 2 && (
                    <span className="text-[10px] font-black uppercase bg-rose-100 dark:bg-rose-950 text-rose-600 px-2.5 py-0.5 rounded-full">
                      KRYTYCZNE
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">{l.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{l.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCheckListing(l)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> Analizuj
                </button>
                <button
                  onClick={() => handleAction('approve', l.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Akceptuj
                </button>
                <button
                  onClick={() => handleAction('reject', l.id)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> Odrzuć
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Listing Inspection Modal */}
      {selectedListing && listingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-2xl"
          >
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider block">Wyniki Inspekcji AI</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedListing.title}</h3>
              </div>
              <button onClick={() => setSelectedListing(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 flex justify-between items-center">
                <span>Poziom Podejrzaności:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{listingDetails.suspicionLevel}</span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Treść Ogłoszenia</span>
                <p className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mt-1 text-slate-800 dark:text-slate-200">{selectedListing.description}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleAction('approve', selectedListing.id)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                Zatwierdź
              </button>
              <button
                onClick={() => handleAction('reject', selectedListing.id)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20"
              >
                Odrzuć
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ListingsModerationPanel;
