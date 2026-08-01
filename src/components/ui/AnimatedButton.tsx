import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
}

export function AnimatedButton({ children, className = '', disabled, ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
      disabled={disabled}
      className={`group relative w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold rounded-2xl hover:opacity-95 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-xl shadow-blue-600/25 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden mt-6 cursor-pointer ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {disabled && props['aria-label'] ? props['aria-label'] : children}
      </span>
    </motion.button>
  );
}
