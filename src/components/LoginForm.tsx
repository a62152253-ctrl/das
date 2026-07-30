import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { AuthView } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseAuth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from '../lib/useToast';
import { Sparkles } from 'lucide-react';

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
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Witaj ponownie</h1>
        <p className="text-slate-500 text-sm">Wprowadź swoje dane, aby uzyskać dostęp do panelu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="space-y-5">
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-widest">Hasło</label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
              >
                Zapomniałeś hasła?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-1">
          <input type="checkbox" id="remember" className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer" />
          <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">Zapamiętaj mnie przez 30 dni</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden mt-6"
        >
          <span className="relative z-10 flex items-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Zaloguj się'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
          </span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 font-medium">
        Nie masz jeszcze konta?{' '}
        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="text-blue-600 hover:underline font-bold focus:outline-none cursor-pointer"
        >
          Zarejestruj się
        </button>
      </p>

    </div>
  );
}
