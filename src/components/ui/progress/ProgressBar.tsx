import React from 'react';
import { motion } from 'motion/react';

interface Props {
  progress: number; // 0 to 100
  label?: string;
  color?: string; // e.g. "bg-blue-600"
}

export function ProgressBar({ progress, label, color = 'bg-blue-600' }: Props) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{label}</span>
          <span className="text-xs font-extrabold text-slate-900">{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
