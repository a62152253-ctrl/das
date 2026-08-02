import React, { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'alert' | 'success';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  subtitle?: string;
  size?: ModalSize;
  variant?: ModalVariant;
  icon?: LucideIcon;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl'
};

const variantConfig = {
  default: {
    headerBg: 'bg-white dark:bg-slate-900',
    headerBorder: 'border-slate-100 dark:border-slate-800',
    headerTitle: 'text-slate-900 dark:text-white'
  },
  alert: {
    headerBg: 'bg-rose-50 dark:bg-rose-950/30',
    headerBorder: 'border-rose-100 dark:border-rose-900/30',
    headerTitle: 'text-rose-900 dark:text-rose-200'
  },
  success: {
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    headerBorder: 'border-emerald-100 dark:border-emerald-900/30',
    headerTitle: 'text-emerald-900 dark:text-emerald-200'
  }
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  subtitle,
  size = 'md',
  variant = 'default',
  icon: Icon,
  footer,
  closeOnBackdropClick = true,
  closeOnEscape = true
}: ModalProps) {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const config = variantConfig[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeOnBackdropClick && onClose()}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border w-full',
                'dark:border-slate-800 border-slate-200 relative my-8',
                sizeMap[size]
              )}
            >
              {/* Header */}
              <div className={cn(
                'flex items-center justify-between p-6 border-b',
                config.headerBg,
                config.headerBorder
              )}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {Icon && (
                    <div className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      {
                        'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400': variant === 'alert',
                        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400': variant === 'success',
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400': variant === 'default'
                      }
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className={cn('text-lg font-bold tracking-tight', config.headerTitle)}>
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                  aria-label="Zamknij"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export type { ModalProps, ModalSize, ModalVariant };
