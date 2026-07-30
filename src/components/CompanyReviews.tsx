import React, { useState } from 'react';
import { Review } from '../types';
import { Star, MessageSquare } from 'lucide-react';

interface Props {
  reviews?: Review[];
}

export function CompanyReviews({ reviews = [] }: Props) {
  // Pre-populated mock replies
  const [replies, setReplies] = useState<{ [reviewId: string]: string }>({
    '1': 'Dziękujemy bardzo za opinię! Zapraszamy ponownie.'
  });
  const [replyInput, setReplyInput] = useState<{ [reviewId: string]: string }>({});

  const handleAddReply = (reviewId: string) => {
    if (!replyInput[reviewId]?.trim()) return;
    setReplies({ ...replies, [reviewId]: replyInput[reviewId] });
    setReplyInput({ ...replyInput, [reviewId]: '' });
  };

  const defaultReviews: Review[] = reviews.length > 0 ? reviews : [
    { id: '1', companyId: 'comp', clientId: 'c1', clientName: 'Andrzej Kowalski', rating: 5, comment: 'Szybko, sprawnie i bardzo dokładnie. Zdecydowanie polecam!', createdAt: 'Dzisiaj, 10:15' },
    { id: '2', companyId: 'comp', clientId: 'c2', clientName: 'Marta Wiśniewska', rating: 4, comment: 'Wszystko super, fachowy kontakt.', createdAt: 'Wczoraj, 18:30' }
  ];

  return (
    <div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Opinie klientów i odpowiedzi</h3>
      
      <div className="space-y-6">
        {defaultReviews.map(r => (
          <div key={r.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-slate-950">{r.clientName}</h4>
                <div className="flex items-center text-amber-500 font-bold gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>{r.rating.toFixed(1)}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{r.createdAt}</span>
            </div>
            
            <p className="text-slate-700 text-sm font-semibold leading-relaxed">
              {r.comment}
            </p>

            {/* Merchant Reply */}
            {replies[r.id] ? (
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <MessageSquare className="w-4.5 h-4.5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest block">Odpowiedź firmy</span>
                  <p className="text-slate-650 text-xs font-semibold mt-1 leading-relaxed">{replies[r.id]}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={replyInput[r.id] || ''}
                  onChange={(e) => setReplyInput({ ...replyInput, [r.id]: e.target.value })}
                  placeholder="Napisz odpowiedź na opinię..."
                  className="flex-1 text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                />
                <button 
                  onClick={() => handleAddReply(r.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Odpowiedz
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
