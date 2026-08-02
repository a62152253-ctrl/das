import React, { useState } from 'react';
import { MessageSquare, Send, Star, Filter, AlertCircle } from 'lucide-react';
import { Review } from '../../../types';

interface Props {
  reviews?: Review[];
  onAddReply: (reviewId: string, replyText: string) => Promise<void> | void;
}

export function CompanyReviews({
  reviews = [],
  onAddReply,
}: Props) {
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'no-reply' | 'positive' | 'critical'>('all');

  const handleReplyChange = (reviewId: string, value: string) => {
    setReplyInput(prev => ({
      ...prev,
      [reviewId]: value,
    }));
  };

  const handleAddReply = async (reviewId: string) => {
    const text = replyInput[reviewId]?.trim();
    if (!text || loading[reviewId]) return;

    setLoading(prev => ({
      ...prev,
      [reviewId]: true,
    }));

    try {
      await onAddReply(reviewId, text);
      setReplyInput(prev => ({
        ...prev,
        [reviewId]: '',
      }));
    } finally {
      setLoading(prev => ({
        ...prev,
        [reviewId]: false,
      }));
    }
  };

  if (!reviews.length) {
    return (
      <div className="rounded-2xl bg-white border-2 border-dashed border-slate-200/60 p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-slate-100">
          <Star className="w-6 h-6 text-slate-400" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">Brak opinii</h4>
        <p className="text-xs text-slate-500">Opinie klientów pojawią się tutaj, gdy tylko zaczniesz otrzymywać recenzje.</p>
      </div>
    );
  }

  // Calculate Average Rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Filter logic
  const filteredReviews = reviews.filter(review => {
    if (activeFilter === 'no-reply') {
      return !review.reply;
    }
    if (activeFilter === 'positive') {
      return review.rating >= 4;
    }
    if (activeFilter === 'critical') {
      return review.rating <= 3;
    }
    return true;
  });

  return (
    <div className="font-sans">
      {/* Header section with average score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Opinie klientów</h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Śledź oceny i odpowiadaj na recenzje, by dbać o wizerunek firmy.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/50 p-4 rounded-xl shadow-3xs">
          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 leading-none">{averageRating}</span>
            <span className="text-xs text-slate-400 font-bold block">Średnia ocena</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`h-3.5 w-3.5 ${idx < Math.round(Number(averageRating)) ? 'fill-current' : 'text-slate-205'}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-500">{reviews.length} opinii</span>
          </div>
        </div>
      </div>

      {/* Interactive Rating Filters */}
      <div className="flex flex-wrap gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 w-fit mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
            activeFilter === 'all' 
              ? 'bg-white text-slate-800 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Wszystkie ({reviews.length})
        </button>
        <button
          onClick={() => setActiveFilter('no-reply')}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
            activeFilter === 'no-reply' 
              ? 'bg-white text-slate-850 shadow-2xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Bez odpowiedzi ({reviews.filter(r => !r.reply).length})
        </button>
        <button
          onClick={() => setActiveFilter('positive')}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
            activeFilter === 'positive' 
              ? 'bg-white text-emerald-700 shadow-2xs' 
              : 'text-slate-500 hover:text-emerald-600'
          }`}
        >
          Pozytywne 4-5★ ({reviews.filter(r => r.rating >= 4).length})
        </button>
        <button
          onClick={() => setActiveFilter('critical')}
          className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
            activeFilter === 'critical' 
              ? 'bg-white text-rose-700 shadow-2xs' 
              : 'text-slate-500 hover:text-rose-600'
          }`}
        >
          Krytyczne 1-3★ ({reviews.filter(r => r.rating <= 3).length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-slate-100">
              <MessageSquare className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Brak opinii w tej kategorii</h4>
            <p className="text-xs text-slate-500">Spróbuj zmienić filtr, aby zobaczyć inne recenzje</p>
          </div>
        ) : (
          filteredReviews.map(review => {
            const text = replyInput[review.id] ?? '';
            const isLoading = loading[review.id];
            const initials = review.clientName ? review.clientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'KL';

            return (
              <article
                key={review.id}
                className="p-5 border border-slate-200/60 bg-white rounded-xl shadow-2xs hover:bg-slate-50/20 transition-all duration-200 animate-fadeIn"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-extrabold text-slate-600">
                      {initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        {review.clientName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5" aria-label={`Ocena ${review.rating} na 5`}>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-3 w-3 ${idx < review.rating ? 'fill-current' : 'text-slate-205'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <time className="text-[9px] font-bold text-slate-400">
                    {review.createdAt}
                  </time>
                </div>

                <p className="mt-3.5 text-xs font-semibold leading-relaxed text-slate-600 pl-12">
                  {review.comment}
                </p>

                {review.reply ? (
                  <div className="mt-4 flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/25 p-4 ml-12 animate-fadeIn">
                    <MessageSquare className="h-4 w-4 shrink-0 text-indigo-550 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                        Odpowiedź firmy
                      </span>
                      <p className="mt-1 text-xs font-semibold text-slate-600 leading-relaxed">
                        {review.reply}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 ml-12 space-y-2.5">
                    <label className="notion-label">Odpowiedz na recenzję</label>
                    <textarea
                      value={text}
                      maxLength={500}
                      rows={2}
                      onChange={(e) => handleReplyChange(review.id, e.target.value)}
                      placeholder="Dziękujemy za opinię! Zapraszamy ponownie..."
                      className="notion-input border border-slate-200 focus:bg-white resize-none text-xs"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400">
                        {text.length}/500 znaków
                      </span>

                      <button
                        disabled={!text.trim() || isLoading}
                        onClick={() => handleAddReply(review.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                      >
                        <Send className="h-3 w-3" aria-hidden="true" />
                        {isLoading ? 'Wysyłanie...' : 'Wyślij odpowiedź'}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
