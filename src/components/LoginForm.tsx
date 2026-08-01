import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { AuthView } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseAuth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from '../lib/useToast';
import { Sparkles } from 'lucide-react';
import { AnimatedButton } from './ui/AnimatedButton';

interface Props {
  onNavigate: (view: AuthView) => void;
}

export function LoginForm({ onNavigate }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Zalogowano pomyślnie', 'Witamy z powrotem w LOKALNIE PRO');
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error('Błąd logowania', 'Nieprawidłowy e-mail lub hasło. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-slate-50 to-slate-100 dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/25 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">Witaj ponownie</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Zaloguj się, aby uzyskać dostęp do serwisu.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1.5">Adres e-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white font-medium text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  placeholder="jan@kowalski.pl"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Hasło</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors focus:outline-none cursor-pointer"
                >
                  Zapomniałeś hasła?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white font-medium text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <input type="checkbox" id="remember" className="w-4 h-4 border-slate-300 dark:border-slate-700 rounded text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer" />
            <label htmlFor="remember" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer select-none">Zapamiętaj mnie przez 30 dni</label>
          </div>

          <AnimatedButton type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Zaloguj się do konta'}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </AnimatedButton>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Nie masz jeszcze konta?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-black focus:outline-none cursor-pointer"
          >
            Zarejestruj się
          </button>
        </p>
      </div>
    </div>
  );
}
