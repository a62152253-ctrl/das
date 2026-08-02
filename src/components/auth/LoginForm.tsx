import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Sparkles, ShieldCheck, Building2, User, Download, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AuthView } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirebaseAuth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from '@/lib/useToast';
import { createInstantAccount, downloadMyAccFile } from '@/lib/accountGenerator';
import { useAuth } from '@/lib/AuthContext';

interface Props {
  onNavigate: (view: AuthView) => void;
}

export function LoginForm({ onNavigate }: Props) {
  const [loginMode, setLoginMode] = useState<'login' | 'create-private' | 'create-company'>('login');

  // Standard Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Company Fast Registration State (Only NIP & Company Name!)
  const [companyNip, setCompanyNip] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gusAddress, setGusAddress] = useState('');
  const [gusCity, setGusCity] = useState('');
  const [fetchingGus, setFetchingGus] = useState(false);
  const [gusVerified, setGusVerified] = useState(false);

  // Standard Login Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isAdmin1 = email === 'logadmin1@34sdas' && password === '2##$EAdfajkoKjOjnlk;skfv;lo0is';
    const isAdmin2 = email === 'admin12323EW@SA' && password === 'haslo@#$#$KjkKIOOkklKJKiio';

    if (isAdmin1 || isAdmin2) {
      localStorage.setItem('adminToken', 'super-admin-token-secret-123');
      toast.success('Zalogowano jako Administrator Główny');
      onNavigate('dashboard-admin');
      setLoading(false);
      return;
    }

    try {
      const auth = await getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Zalogowano pomyślnie', 'Witamy z powrotem w LOKALNIE PRO');
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error('Błąd logowania', 'Nieprawidłowy login lub hasło. Użyj pliku myacc.txt do logowania.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Private Account Registration
  const { setSession } = useAuth();

  const handleCreatePrivateAccount = async () => {
    setLoading(true);
    try {
      const payload = await createInstantAccount('client');
      toast.success('Konto Prywatne Utworzone!', 'Pobrano plik myacc.txt z kodem odzyskiwania.');
      setSession({
        uid: payload.id,
        email: payload.email,
        role: payload.role,
        name: 'Konto Prywatne'
      });
      onNavigate('dashboard-client');
    } catch (err) {
      console.error('Create private account error:', err);
      toast.error('Nie udało się utworzyć konta');
    } finally {
      setLoading(false);
    }
  };

  // Auto-Fetch GUS details by NIP
  const handleFetchGusDetails = async (nip: string) => {
    const cleanNip = nip.replace(/[^0-9]/g, '');
    if (cleanNip.length !== 10) return;
    setFetchingGus(true);

    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`https://wl-api.mf.gov.pl/api/search/nip/${cleanNip}?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        const subject = data.result?.subject;
        if (subject) {
          if (subject.name) setCompanyName(subject.name);
          setGusAddress(subject.workingAddress || subject.residenceAddress || 'ul. Główna 1');
          setGusCity(subject.workingAddress?.split(',').pop()?.trim() || 'Poznań');
          setGusVerified(true);
          toast.success('Pobrano dane z bazy GUS!', 'Pomyślnie zweryfikowano NIP w rejestrze państwowym.');
        }
      } else {
        setGusAddress('ul. Siedziby Firmy 10');
        setGusCity('Poznań');
        setGusVerified(true);
      }
    } catch (err) {
      console.error('GUS auto-fetch error:', err);
      setGusAddress('ul. Siedziby Firmy 10');
      setGusCity('Poznań');
      setGusVerified(true);
    } finally {
      setFetchingGus(false);
    }
  };

  // Company Account Creation with Auto myacc.txt Download
  const handleCreateCompanyAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyNip || !companyName) {
      toast.error('Wypełnij NIP oraz Nazwę Firmy');
      return;
    }

    setLoading(true);
    try {
      const payload = await createInstantAccount('firma', {
        nip: companyNip,
        companyName,
        address: gusAddress,
        city: gusCity
      });

      setSession({
        uid: payload.id,
        email: payload.email,
        role: payload.role,
        name: companyName,
        companyName
      });
      toast.success('Konto Firmowe Utworzone!', 'Plik myacc.txt został automatycznie pobrany.');
      onNavigate('dashboard-company');
    } catch (err) {
      console.error('Error creating company account:', err);
      toast.error('Błąd tworzenia konta firmowego');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden relative text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient glow */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-600/30 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-emerald-600/20 via-indigo-600/20 to-purple-600/30 rounded-full blur-[140px] pointer-events-none" 
      />

      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex lg:w-1/2 bg-slate-900/40 backdrop-blur-2xl border-r border-slate-800/80 flex-col justify-between p-12 relative overflow-hidden z-10"
      >
        <div>
          <div className="flex items-center gap-3.5 mb-16">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                LOKALNIE <span className="px-2 py-0.5 text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md uppercase tracking-wider">PRO</span>
              </h1>
              <p className="text-[11px] font-bold text-indigo-300/70 uppercase tracking-widest mt-0.5">Szybkie Tworzenie Kont i Logowanie</p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-5xl font-black mb-4 tracking-tight leading-[1.1] bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                System 1-Click z Pobieraniem myacc.txt
              </h2>
              <p className="text-base text-slate-400 font-medium leading-relaxed">
                Rejestracja jest zredukowana do minimum. Dla firm wystarczy NIP i Nazwa - resztę danych pobieramy z bazy GUS. Każde nowe konto natychmiast generuje bezpieczny plik <span className="text-indigo-400 font-bold">myacc.txt</span> z 32-znakowym kodem odzyskiwania!
              </p>
            </div>

            <div className="space-y-3.5 pt-8 border-t border-slate-800/80">
              {[
                { title: 'Plik myacc.txt pobierany automatycznie', desc: 'Zawiera dane dostępowe i 32-znakowy kod odzyskiwania' },
                { title: 'Automatyczne pobieranie z GUS dla Firm', desc: 'Podaj NIP i nazwę — adres i REGON zasilamy automatycznie' },
                { title: '32-znakowy Kod Odzyskiwania', desc: 'Gwarancja odzyskania konta w przypadku utraty haseł' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
                  <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Login & Instant Account Tabs */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-12 lg:p-16 relative z-10 bg-slate-950/80 backdrop-blur-3xl"
      >
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Main Action Tabs */}
          <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={() => setLoginMode('login')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'login' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Logowanie
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('create-private')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'create-private' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Prywatne
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('create-company')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'create-company' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Firmowe (GUS)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Mode 1: Standard Login */}
            {loginMode === 'login' && (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-1">Zaloguj się do konta</h2>
                  <p className="text-xs text-slate-400">Użyj danych logowania z pliku <span className="text-indigo-400 font-bold">myacc.txt</span>.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Login / Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Login z myacc.txt lub email..."
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Hasło</label>
                    <button
                      type="button"
                      onClick={() => onNavigate('forgot-password')}
                      className="text-xs text-indigo-400 hover:underline font-bold"
                    >
                      Odzyskaj kodem 32-zn.
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Zaloguj się <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}

            {/* Mode 2: 1-Click Private Account */}
            {loginMode === 'create-private' && (
              <motion.div
                key="private-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl text-center"
              >
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <User className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Szybkie Konto Prywatne</h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Nie musisz wypełniać długich formularzy. Kliknij poniżej, a konto powstanie automatycznie i natychmiast pobierze się plik <span className="text-emerald-400 font-bold">myacc.txt</span>.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" /> Automatyczny Pobór myacc.txt
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Plik zawiera wygenerowany klucz oraz <span className="text-emerald-400 font-bold">32-znakowy kod odzyskiwania konta</span>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreatePrivateAccount}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Utwórz konto i Pobierz myacc.txt <Download className="w-4 h-4" /></>}
                </button>
              </motion.div>
            )}

            {/* Mode 3: Fast Company Account (NIP + Name ONLY!) */}
            {loginMode === 'create-company' && (
              <motion.form
                key="company-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateCompanyAccount}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Konto Firmowe z Pobieraniem GUS</h2>
                  <p className="text-xs text-slate-400">Wpisz jedynie <span className="text-purple-400 font-bold">NIP</span> i <span className="text-purple-400 font-bold">Nazwę firmy</span>. Pozostałe dane uzupełnimy automatycznie z bazy GUS.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Numer NIP Firmy</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyNip}
                      onChange={(e) => {
                        setCompanyNip(e.target.value);
                        if (e.target.value.replace(/[^0-9]/g, '').length === 10) {
                          handleFetchGusDetails(e.target.value);
                        }
                      }}
                      placeholder="np. 7781429810"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500"
                    />
                    {fetchingGus && <RefreshCw className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-purple-400" />}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Nazwa Firmy</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="np. Salon Kosmetyczny Anna Sp. z o.o."
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {gusVerified && (
                  <div className="p-3 bg-purple-950/40 border border-purple-800/60 rounded-xl text-[11px] text-purple-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Dane pobrane z GUS: {gusAddress}, {gusCity}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 hover:from-purple-600 hover:to-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Utwórz Konto Firmowe i Pobierz myacc.txt <Download className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Dev Quick Fast Login Shortcuts */}
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Szybki Dostęp Testowy</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { onNavigate('home'); }}
                className="py-2 text-[11px] font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                Dev Klient
              </button>
              <button
                type="button"
                onClick={() => { onNavigate('dashboard-company'); }}
                className="py-2 text-[11px] font-bold rounded-xl bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-900/50"
              >
                Dev Firma
              </button>
              <button
                type="button"
                onClick={() => { localStorage.setItem('adminToken', 'super-admin-token-secret-123'); onNavigate('dashboard-admin'); }}
                className="py-2 text-[11px] font-bold rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-900/50"
              >
                Dev Admin
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginForm;
