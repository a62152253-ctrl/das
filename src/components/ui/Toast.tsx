import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast, ToastType, toast } from '../../lib/useToast';

export { toast };

export function addToast(title: string, type: ToastType = 'info', message?: string) {
  if (type === 'success') {
    toast.success(title, message);
  } else if (type === 'error') {
    toast.error(title, message);
  } else {
    toast.info(title, message);
  }
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
};

const bgColors = {
  success: 'bg-emerald-50 dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200',
  error: 'bg-rose-50 dark:bg-slate-800 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200',
  info: 'bg-indigo-50 dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full font-sans">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${bgColors[t.type]}`}
          >
            <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
            <div className="flex-1">
              <h4 className="text-xs font-bold">{t.title}</h4>
              {t.message && <p className="text-[11px] mt-1 opacity-90 leading-relaxed">{t.message}</p>}
            </div>
            <button 
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
