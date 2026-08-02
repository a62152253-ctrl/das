import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success'
  | 'gradient';

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

interface ButtonProps extends 
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
  Omit<MotionProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  rounded?: boolean;
  children?: React.ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-indigo-600 to-purple-600 
    hover:from-indigo-700 hover:to-purple-700 
    text-white border-transparent
    shadow-lg hover:shadow-xl
    glow-primary
  `,
  secondary: `
    bg-neutral-100 hover:bg-neutral-200 
    text-neutral-900 border-neutral-300
    shadow-sm hover:shadow-md
    dark:bg-neutral-800 dark:hover:bg-neutral-700 
    dark:text-neutral-100 dark:border-neutral-600
  `,
  outline: `
    bg-transparent hover:bg-neutral-50 
    text-neutral-700 border-neutral-300
    hover:border-neutral-400
    dark:hover:bg-neutral-800 
    dark:text-neutral-300 dark:border-neutral-600
    dark:hover:border-neutral-500
  `,
  ghost: `
    bg-transparent hover:bg-neutral-100 
    text-neutral-700 border-transparent
    dark:hover:bg-neutral-800 
    dark:text-neutral-300
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-red-600 
    hover:from-red-600 hover:to-red-700 
    text-white border-transparent
    shadow-lg hover:shadow-xl
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-green-600 
    hover:from-emerald-600 hover:to-green-700 
    text-white border-transparent
    shadow-lg hover:shadow-xl
  `,
  gradient: `
    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
    hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
    text-white border-transparent
    shadow-xl hover:shadow-2xl
    glow-rainbow
  `
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-medium',
  md: 'h-10 px-4 text-sm font-semibold',
  lg: 'h-12 px-6 text-base font-semibold',
  xl: 'h-14 px-8 text-lg font-bold',
  icon: 'h-10 w-10 text-sm'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText = 'Loading...',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    fullWidth = false,
    rounded = false,
    disabled,
    children,
    className,
    ...props
  }, ref) => {
    
    const buttonClass = cn(
      // Base styles
      `inline-flex items-center justify-center gap-2 
       border transition-all duration-300 ease-out
       font-medium tracking-tight
       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
       disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
       select-none relative overflow-hidden group`,
      
      // Size variants
      buttonSizes[size],
      
      // Visual variants
      buttonVariants[variant],
      
      // Conditional styles
      {
        'w-full': fullWidth,
        'rounded-full': rounded,
        'rounded-xl': !rounded && size !== 'icon',
        'rounded-lg': !rounded && size === 'icon'
      },
      
      className
    );

    const content = loading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        {size !== 'icon' && (loadingText || children)}
      </>
    ) : (
      <>
        {LeftIcon && <LeftIcon className="w-4 h-4" />}
        {size !== 'icon' && children}
        {RightIcon && <RightIcon className="w-4 h-4" />}
      </>
    );

    return (
      <motion.button
        ref={ref}
        type={props.type ?? 'button'}
        className={buttonClass}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {/* Shine effect overlay */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {content}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Compound component for button groups
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  attached?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  attached = false
}) => {
  return (
    <div 
      className={cn(
        'flex',
        {
          'flex-row': orientation === 'horizontal',
          'flex-col': orientation === 'vertical',
          'divide-x dark:divide-neutral-700': attached && orientation === 'horizontal',
          'divide-y dark:divide-neutral-700': attached && orientation === 'vertical',
          'gap-2': !attached,
          '[&>*]:rounded-none [&>*:first-child]:rounded-l-xl [&>*:last-child]:rounded-r-xl': 
            attached && orientation === 'horizontal',
          '[&>*]:rounded-none [&>*:first-child]:rounded-t-xl [&>*:last-child]:rounded-b-xl': 
            attached && orientation === 'vertical'
        },
        className
      )}
    >
      {children}
    </div>
  );
};

// Icon button shorthand
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: LucideIcon;
  'aria-label': string;
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, tooltip, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        title={tooltip}
        {...props}
      >
        <Icon className="w-4 h-4" />
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export type { ButtonProps, ButtonVariant, ButtonSize };
