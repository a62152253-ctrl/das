import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { AuthView } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseAuth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from '../lib/useToast';

interface Props {
  onNavigate: (view: AuthView) => void;
}

export function ForgotPasswordForm({ onNavigate }: Props) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success('Email wysłany', 'Sprawdź swoją skrzynkę odbiorczą, aby zresetować hasło.');
      setTimeout(() => onNavigate('login'), 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      toast.error('Wystąpił błąd', err.message || 'Nie udało się wysłać linku. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <button 
          onClick={() => onNavigate('login')}
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć do logowania
        </button>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Zresetuj hasło</h1>
        <p className="text-slate-500 text-sm">Wprowadź swój adres e-mail, a wyślemy Ci link do zresetowania hasła.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Adres e-mail</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              placeholder="jan@kowalski.pl"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden"
        >
          <span className="relative z-10 flex items-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Wyślij link resetujący'}
          </span>
        </button>
      </form>
    </div>
  );
}
