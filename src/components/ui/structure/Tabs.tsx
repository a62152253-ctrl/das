import React, { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'minimal';
  className?: string;
  contentClassName?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'default',
  className,
  contentClassName
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabItem = tabs.find(t => t.id === activeTab);

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className={cn(
        'flex border-b',
        {
          'border-slate-200 dark:border-slate-700': variant === 'default',
          'border-transparent': variant !== 'default'
        }
      )}>
        {variant === 'pills' && (
          <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-lg w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'px-4 py-2 rounded-md font-semibold text-sm transition-all flex items-center gap-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {variant === 'default' && (
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'px-4 py-3 font-semibold text-sm transition-all flex items-center gap-2 relative',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  activeTab === tab.id
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {tab.badge}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {variant === 'minimal' && (
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'font-semibold text-sm transition-colors pb-1 border-b-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  activeTab === tab.id
                    ? 'text-slate-900 dark:text-white border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTabItem && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn('pt-4', contentClassName)}
        >
          {activeTabItem.content}
        </motion.div>
      )}
    </div>
  );
};

export type { TabsProps, TabItem };
