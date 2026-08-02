import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  dotted?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
  success: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
  warning: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  danger: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  info: 'bg-sky-100 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  dotted = false,
  className
}) => {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold rounded-full',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {dotted && <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        {
          'bg-indigo-500': variant === 'primary',
          'bg-emerald-500': variant === 'success',
          'bg-amber-500': variant === 'warning',
          'bg-rose-500': variant === 'danger',
          'bg-slate-500': variant === 'neutral',
          'bg-sky-500': variant === 'info'
        }
      )} />}
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
};

export type { BadgeProps };
