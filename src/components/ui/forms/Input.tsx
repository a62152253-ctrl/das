import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Eye, EyeOff, AlertCircle, CheckCircle, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'underlined';
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

const inputSizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base'
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5'
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    description,
    error,
    success,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    size = 'md',
    variant = 'default',
    loading,
    clearable,
    onClear,
    type,
    className,
    disabled,
    ...props
  }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && isPasswordVisible ? 'text' : type;
    
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const hasLeftIcon = !!LeftIcon;
    const hasRightIcon = !!RightIcon || isPassword || clearable || loading;

    const inputClass = cn(
      // Base styles
      'w-full font-medium transition-all duration-300 ease-out',
      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Size variants
      inputSizes[size],
      
      // Padding adjustments for icons
      {
        'pl-10': hasLeftIcon && size === 'md',
        'pl-9': hasLeftIcon && size === 'sm',
        'pl-12': hasLeftIcon && size === 'lg',
        'pr-10': hasRightIcon && size === 'md',
        'pr-9': hasRightIcon && size === 'sm',
        'pr-12': hasRightIcon && size === 'lg'
      },
      
      // Variant styles
      {
        // Default variant
        'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl': 
          variant === 'default',
        'hover:border-neutral-300 dark:hover:border-neutral-600': 
          variant === 'default' && !disabled && !hasError,
          
        // Filled variant
        'bg-neutral-50 dark:bg-neutral-800 border border-transparent rounded-xl': 
          variant === 'filled',
        'hover:bg-neutral-100 dark:hover:bg-neutral-700': 
          variant === 'filled' && !disabled && !hasError,
          
        // Underlined variant
        'bg-transparent border-0 border-b-2 border-neutral-200 dark:border-neutral-700 rounded-none': 
          variant === 'underlined',
        'hover:border-neutral-300 dark:hover:border-neutral-600': 
          variant === 'underlined' && !disabled && !hasError
      },
      
      // Focus states
      {
        'focus:ring-indigo-500 focus:border-indigo-500': !hasError && !hasSuccess,
        'focus:ring-red-500 focus:border-red-500': hasError,
        'focus:ring-green-500 focus:border-green-500': hasSuccess
      },
      
      // Error states
      {
        'border-red-300 dark:border-red-600': hasError,
        'bg-red-50 dark:bg-red-950/20': hasError && variant === 'filled'
      },
      
      // Success states
      {
        'border-green-300 dark:border-green-600': hasSuccess,
        'bg-green-50 dark:bg-green-950/20': hasSuccess && variant === 'filled'
      },
      
      className
    );

    const iconClass = cn(
      iconSizes[size],
      'text-neutral-400 dark:text-neutral-500',
      {
        'text-red-400': hasError,
        'text-green-400': hasSuccess
      }
    );

    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {LeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <LeftIcon className={iconClass} />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={inputClass}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Loading Spinner */}
            {loading && (
              <div className="animate-spin">
                <div className={cn('border-2 border-neutral-300 border-t-indigo-500 rounded-full', {
                  'w-3 h-3': size === 'sm',
                  'w-4 h-4': size === 'md',
                  'w-5 h-5': size === 'lg'
                })} />
              </div>
            )}

            {/* Clear Button */}
            {clearable && props.value && !loading && (
              <button
                type="button"
                onClick={onClear}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className={iconSizes[size]} />
              </button>
            )}

            {/* Password Toggle */}
            {isPassword && !loading && (
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {isPasswordVisible ? (
                  <EyeOff className={iconSizes[size]} />
                ) : (
                  <Eye className={iconSizes[size]} />
                )}
              </button>
            )}

            {/* Custom Right Icon */}
            {RightIcon && !loading && (
              <RightIcon className={iconClass} />
            )}

            {/* Status Icons */}
            {hasError && !loading && (
              <AlertCircle className={cn(iconSizes[size], 'text-red-500')} />
            )}
            
            {hasSuccess && !loading && (
              <CheckCircle className={cn(iconSizes[size], 'text-green-500')} />
            )}
          </div>
        </div>

        {/* Description */}
        {description && !error && !success && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              {success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  resize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    label,
    description,
    error,
    success,
    resize = true,
    className,
    ...props
  }, ref) => {
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const textareaClass = cn(
      // Base styles
      'w-full px-4 py-3 font-medium transition-all duration-300 ease-out',
      'bg-white dark:bg-neutral-900 border rounded-xl',
      'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'min-h-[100px]',
      
      // Resize behavior
      {
        'resize-none': !resize,
        'resize-y': resize
      },
      
      // Border colors
      {
        'border-neutral-200 dark:border-neutral-700': !hasError && !hasSuccess,
        'hover:border-neutral-300 dark:hover:border-neutral-600': !hasError && !hasSuccess,
        'focus:ring-indigo-500 focus:border-indigo-500': !hasError && !hasSuccess,
        'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': hasError,
        'border-green-300 dark:border-green-600 focus:ring-green-500 focus:border-green-500': hasSuccess
      },
      
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          className={textareaClass}
          {...props}
        />

        {description && !error && !success && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              {success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, placeholder = 'Szukaj...', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="text"
        leftIcon={Search}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSearch) {
            onSearch(e.currentTarget.value);
          }
        }}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export type { InputProps, TextareaProps, SearchInputProps };