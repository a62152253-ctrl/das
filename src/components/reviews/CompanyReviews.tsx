import React, { useState, useEffect } from 'react';
import { Star, Send, Filter, Image, CornerDownRight, ThumbsUp, Loader2 } from 'lucide-react';
import { Review } from '@/types';
import { useAuth } from '@/lib/AuthContext';
import { getFirebaseDb } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { createNotification } from '@/lib/NotificationEngine';

interface Props {
  companyId: string;
  companyName: string;
  isOwner?: boolean;
}

export function CompanyReviews({ companyId, companyName, isOwner }: Props) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // New Review Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [replySubmitting, setReplySubmitting] = useState<Record<string, boolean>>({});

  const fetchReviews = async () => {
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, 'reviews'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      const list: Review[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
      setReviews(list);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchReviews();
  }, [companyId]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const db = getFirebaseDb();
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'reviews'), {
        companyId,
        clientId: user.uid,
        clientName: profile?.name || user.displayName || 'Klient',
        rating,
        comment: comment.trim(),
        createdAt: now,
        images: imageUrl.trim() ? [imageUrl.trim()] : []
      });

      // Update average company rating in companies doc
      const updatedReviews = [...reviews, {
        id: docRef.id,
        companyId,
        clientId: user.uid,
        clientName: profile?.name || user.displayName || 'Klient',
        rating,
        comment: comment.trim(),
        createdAt: now,
        images: imageUrl.trim() ? [imageUrl.trim()] : []
      }];

      const newAvg = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1);
      await updateDoc(doc(db, 'companies', companyId), {
        rating: parseFloat(newAvg),
        reviewCount: updatedReviews.length
      });

      // Notify company
      await createNotification({
        userId: companyId,
        title: 'Nowa opinia o Twojej firmie',
        content: `${profile?.name || 'Klient'} wystawił(a) ocenę ${rating}/5 gwiazdek: "${comment.slice(0, 30)}..."`,
        type: 'review',
        linkId: docRef.id
      });

      setComment('');
      setImageUrl('');
      setRating(5);
      await fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text || replySubmitting[reviewId]) return;

    setReplySubmitting(prev => ({ ...prev, [reviewId]: true }));
    try {
      const db = getFirebaseDb();
      const ref = doc(db, 'reviews', reviewId);
      const now = new Date().toISOString();
      await updateDoc(ref, {
        reply: text,
        replyCreatedAt: now
      });

      setReplyTextMap(prev => ({ ...prev, [reviewId]: '' }));
      await fetchReviews();
    } catch (err) {
      console.error('Error adding reply:', err);
    } finally {
      setReplySubmitting(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortFilter === 'highest') return b.rating - a.rating;
    if (sortFilter === 'lowest') return a.rating - b.rating;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const avgScore = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Opinie i oceny klientów</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recenzje bezpośrednio od zweryfikowanych klientów</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{avgScore}</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Średnia</span>
          </div>
          <div className="flex flex-col">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3.5 h-3.5 ${idx < Math.round(Number(avgScore)) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{reviews.length} opinii</span>
          </div>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Filter className="w-3.5 h-3.5" /> Sortowanie:
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setSortFilter('newest')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              sortFilter === 'newest' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Najnowsze
          </button>
          <button
            onClick={() => setSortFilter('highest')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              sortFilter === 'highest' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Najwyższe
          </button>
          <button
            onClick={() => setSortFilter('lowest')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              sortFilter === 'lowest' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Najniższe
          </button>
        </div>
      </div>

      {/* Write a review form (For clients) */}
      {user && user.uid !== companyId && (
        <form onSubmit={handleAddReview} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3 border border-slate-200/60 dark:border-slate-700">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Dodaj swoją opinię</h4>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-2">Ocena:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Napisz opinię o jakości usługi, terminowości i kontakcie z firmą..."
            rows={3}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
          />

          <div className="flex items-center justify-between gap-3">
            <input
              type="url"
              placeholder="Opcjonalny URL zdjęcia realizacji (https://...)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Dodaj opinię
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Ładowanie opinii...</div>
        ) : sortedReviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Firma nie posiada jeszcze opinii. Bądź pierwszy!
          </div>
        ) : (
          sortedReviews.map(rev => (
            <div key={rev.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {rev.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{rev.clientName}</h5>
                    <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rev.comment}</p>

              {rev.images && rev.images.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.images.map((img, idx) => (
                    <img key={idx} src={img} alt="Zdjęcie opinii" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                  ))}
                </div>
              )}

              {/* Company Reply */}
              {rev.reply ? (
                <div className="mt-2 ml-4 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border-l-2 border-indigo-500 rounded-r-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                    <span>Odpowiedź firmy ({companyName}):</span>
                    {rev.replyCreatedAt && <span className="text-[10px] text-slate-400 font-normal">{new Date(rev.replyCreatedAt).toLocaleDateString()}</span>}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{rev.reply}</p>
                </div>
              ) : isOwner ? (
                <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex gap-2">
                  <input
                    type="text"
                    placeholder="Odpowiedz na tę opinię..."
                    value={replyTextMap[rev.id] || ''}
                    onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleAddReply(rev.id)}
                    disabled={replySubmitting[rev.id]}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Odpowiedz
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
