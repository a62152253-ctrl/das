import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hover?: boolean;
  interactive?: boolean;
}

const cardVariants = {
  default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700',
  elevated: 'bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800',
  outlined: 'bg-transparent border-2 border-neutral-200 dark:border-neutral-700',
  glass: 'glass-effect border border-white/20 dark:border-white/10',
  gradient: 'bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 border border-neutral-200 dark:border-neutral-700'
};

const cardPadding = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10'
};

const cardRounded = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full'
};

const cardShadow = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl'
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    rounded = 'xl',
    shadow = 'md',
    hover = false,
    interactive = false,
    className,
    children,
    ...props
  }, ref) => {
    const cardClass = cn(
      // Base styles
      'relative transition-all duration-300 ease-out',
      
      // Variant styles
      cardVariants[variant],
      
      // Spacing
      cardPadding[padding],
      
      // Border radius
      cardRounded[rounded],
      
      // Shadow
      cardShadow[shadow],
      
      // Hover effects
      {
        'hover:shadow-lg hover:-translate-y-1': hover,
        'cursor-pointer select-none': interactive,
        'hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md': interactive
      },
      
      className
    );

    const motionProps = interactive ? {
      whileHover: { y: -2, scale: 1.02 },
      whileTap: { y: 0, scale: 0.98 },
      transition: { type: "spring", stiffness: 400, damping: 25 }
    } : {};

    return (
      <motion.div
        ref={ref}
        className={cardClass}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  divider?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, icon: Icon, action, divider = true, className, children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          'flex items-start justify-between',
          { 'border-b border-neutral-200 dark:border-neutral-700 pb-4 mb-4': divider },
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {Icon && (
            <div className="flex-shrink-0 mt-1">
              <Icon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>
        
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body Component
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ spacing = 'none', className, ...props }, ref) => {
    const spacingClasses = {
      none: '',
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6'
    };

    return (
      <div
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      />
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ divider = true, justify = 'end', className, ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          justifyClasses[justify],
          { 'border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4': divider },
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  loading?: boolean;
  className?: string;
}

const statColorClasses = {
  primary: {
    icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20',
    trend: {
      positive: 'text-indigo-600 dark:text-indigo-400',
      negative: 'text-indigo-600 dark:text-indigo-400'
    }
  },
  success: {
    icon: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20',
    trend: {
      positive: 'text-green-600 dark:text-green-400',
      negative: 'text-red-600 dark:text-red-400'
    }
  },
  warning: {
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20',
    trend: {
      positive: 'text-green-600 dark:text-green-400',
      negative: 'text-red-600 dark:text-red-400'
    }
  },
  danger: {
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
    trend: {
      positive: 'text-green-600 dark:text-green-400',
      negative: 'text-red-600 dark:text-red-400'
    }
  },
  neutral: {
    icon: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800',
    trend: {
      positive: 'text-green-600 dark:text-green-400',
      negative: 'text-red-600 dark:text-red-400'
    }
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  loading = false,
  className
}) => {
  const colorClasses = statColorClasses[color];

  return (
    <Card variant="elevated" className={cn('overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            {title}
          </p>
          
          {loading ? (
            <div className="space-y-2">
              <div className="h-8 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded" />
              {subtitle && (
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 animate-pulse rounded w-2/3" />
              )}
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {value}
              </p>
              
              {subtitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {subtitle}
                </p>
              )}
              
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn(
                    'text-xs font-semibold',
                    trend.isPositive 
                      ? colorClasses.trend.positive 
                      : colorClasses.trend.negative
                  )}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                  {trend.label && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {trend.label}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {Icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colorClasses.icon)}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps, StatCardProps };