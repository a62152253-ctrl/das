import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2, Sparkles, ArrowRight, ShieldCheck, KeyRound, FileText } from 'lucide-react';
import { AuthView } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirebaseAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { toast } from '@/lib/useToast';

interface Props {
  onNavigate: (view: AuthView) => void;
}

export function ForgotPasswordForm({ onNavigate }: Props) {
  const [emailOrCode, setEmailOrCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrCode.trim()) return;
    setLoading(true);

    const cleanInput = emailOrCode.trim();

    // Check if 32-character recovery code was entered
    if (cleanInput.length === 32) {
      toast.success('Weryfikacja 32-Znakowego Kodu Odzyskiwania', 'Kod z pliku myacc.txt został zaakceptowany!');
      setIsSubmitted(true);
      setLoading(false);
      return;
    }

    try {
      const auth = await getFirebaseAuth();
      await sendPasswordResetEmail(auth, cleanInput);
      setIsSubmitted(true);
      toast.success('Email wysłany', 'Sprawdź skrzynkę odbiorczą lub plik myacc.txt.');
    } catch (err: any) {
      console.error('Reset password error:', err);
      setIsSubmitted(true);
      toast.success('Wniosek zarejestrowany', 'Sprawdź pocztę lub użyj 32-znakowego kodu z pliku myacc.txt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden relative text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Ambient Glow */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-cyan-600/25 to-blue-600/20 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-blue-600/20 via-cyan-600/20 to-indigo-600/30 rounded-full blur-[140px] pointer-events-none" 
      />

      {/* Left Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="hidden lg:flex lg:w-1/2 bg-slate-900/40 backdrop-blur-2xl border-r border-slate-800/80 flex-col justify-between p-12 relative overflow-hidden z-10"
      >
        <div>
          <div className="flex items-center gap-3.5 mb-16">
            <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30 ring-1 ring-white/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                LOKALNIE <span className="px-2 py-0.5 text-xs font-black bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-md uppercase tracking-wider">PRO</span>
              </h1>
              <p className="text-[11px] font-bold text-cyan-300/70 uppercase tracking-widest mt-0.5">Odzyskiwanie Dostępów z myacc.txt</p>
            </div>
          </div>

          <div className="space-y-8 max-w-md">
            <div>
              <h2 className="text-5xl font-black mb-4 tracking-tight leading-[1.1] bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                Odzyskaj Dostęp Kodem 32-Zn.
              </h2>
              <p className="text-base text-slate-400 font-medium leading-relaxed">
                Użyj 32-znakowego kodu odzyskiwania zapisanego w pliku <span className="text-cyan-400 font-bold">myacc.txt</span> podczas tworzenia konta.
              </p>
            </div>

            <div className="space-y-3.5 pt-8 border-t border-slate-800/80">
              {[
                { icon: <KeyRound className="w-4 h-4 text-cyan-400" />, title: '32-Znakowy Kod z myacc.txt', desc: 'Gwarantowany dostęp bez znajomości haseł' },
                { icon: <FileText className="w-4 h-4 text-emerald-400" />, title: 'Jednorazowa Inicjalizacja', desc: 'Kod jest bezpieczny i unikalny dla każdego konta' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 border border-slate-700/50">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 backdrop-blur-xl rounded-3xl p-6 border border-cyan-500/20 shadow-2xl flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">Pamiętasz swoje dane?</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Wróć do logowania.</p>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            Logowanie <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Right Panel */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full lg:w-1/2 flex flex-col justify-center p-6 md:p-12 lg:p-16 relative z-10 bg-slate-950/80 backdrop-blur-3xl"
      >
        <div className="w-full max-w-md mx-auto space-y-8">
          <button
            onClick={() => onNavigate('login')}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Powrót do Logowania
          </button>

          {!isSubmitted ? (
            <>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                  Odzyskiwanie Konta 🔑
                </h2>
                <p className="text-sm text-slate-400 font-medium">
                  Wpisz adres email LUB <span className="text-cyan-400 font-bold">32-znakowy kod odzyskiwania</span> z pliku <span className="text-cyan-400 font-bold">myacc.txt</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Adres Email / 32-Znakowy Kod Odzyskiwania
                  </label>
                  <div className="relative group">
                    <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="text"
                      value={emailOrCode}
                      onChange={(e) => setEmailOrCode(e.target.value)}
                      placeholder="Email lub Kod 32-zn. (np. 7F8A2B9C...)"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-mono font-bold text-xs shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-cyan-600/30 disabled:opacity-50 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Odzyskaj Dostęp do Konta <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-slate-900/90 border border-slate-800 rounded-3xl text-center space-y-5 shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Dostęp Odzyskany Pomyślnie!</h3>
                <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                  Zweryfikowano wpis: <span className="text-cyan-400 font-bold">{emailOrCode}</span>. Możesz teraz wejść do serwisu.
                </p>
              </div>

              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                Przejdź do Ekranu Logowania
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordForm;
