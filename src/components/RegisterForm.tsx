import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Building2, UserCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { AuthView } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseAuth, getFirebaseDb } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '../lib/useToast';
import { ProgressBar } from './ui/ProgressBar';

interface Props {
  onNavigate: (view: AuthView) => void;
}

export function RegisterForm({ onNavigate }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'firma'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = await getFirebaseAuth();
      const db = await getFirebaseDb();
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name,
        role,
        createdAt: serverTimestamp(),
      });
      localStorage.setItem('user_role_' + user.uid, role);
      localStorage.setItem('has_company_profile_' + user.uid, 'false');
      toast.success('Konto utworzone', 'Witamy na platformie LOKALNIE PRO!');
      if (role === 'firma') {
        onNavigate('create-company-profile');
      } else {
        onNavigate('login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Błąd rejestracji', 'Konto z podanym adresem e-mail już istnieje.');
      } else {
        toast.error('Błąd rejestracji', err.message || 'Nie udało się utworzyć konta. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 6) score += 25;
    if (pass.length > 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(password);
  const strengthColor = strength < 50 ? 'bg-red-500' : strength < 75 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Utwórz konto</h1>
        <p className="text-slate-500 text-sm">Dołącz do naszej platformy dzisiaj. To zajmie tylko chwilę.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Jestem...</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${role === 'client' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <UserCircle className={`w-7 h-7 mb-2 ${role === 'client' ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-sm font-bold">Klient</span>
              {role === 'client' && <motion.div layoutId="role-indicator" className="absolute inset-0 border-2 border-blue-600 rounded-2xl pointer-events-none" />}
            </button>
            <button
              type="button"
              onClick={() => setRole('firma')}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${role === 'firma' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <Building2 className={`w-7 h-7 mb-2 ${role === 'firma' ? 'text-white' : 'text-slate-400'}`} />
              <span className="text-sm font-bold">Firma</span>
              {role === 'firma' && <motion.div layoutId="role-indicator" className="absolute inset-0 border-2 border-blue-600 rounded-2xl pointer-events-none" />}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
              {role === 'firma' ? 'Nazwa firmy' : 'Imię i nazwisko'}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                {role === 'firma' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                placeholder={role === 'firma' ? 'Moja Firma Sp. z o.o.' : 'Jan Kowalski'}
              />
            </div>
          </div>

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
            <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Hasło</label>
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
            
            {password.length > 0 && (
              <div className="mt-3">
                <ProgressBar progress={strength} label="Siła hasła" color={strengthColor} />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden mt-8"
        >
          <span className="relative z-10 flex items-center">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Utwórz konto'}
            {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
          </span>
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500 font-medium">
        Masz już konto?{' '}
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-blue-600 hover:underline font-bold focus:outline-none cursor-pointer"
        >
          Zaloguj się
        </button>
      </p>
    </div>
  );
}
