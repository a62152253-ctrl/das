import React, { useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number; // e.g. 12 (positive), -5 (negative)
  prefix?: string;
  suffix?: string;
}

export function StatCard({ title, value, icon, trend, prefix = '', suffix = '' }: Props) {
  // Simple count up animation effect
  const [displayValue, setDisplayValue] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1000;
      const increment = value / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, isInView]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
            trend > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h4>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-slate-500 font-bold">{prefix}</span>}
          <span className="text-3xl font-black text-slate-950">{displayValue}</span>
          {suffix && <span className="text-slate-500 font-bold">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
}
