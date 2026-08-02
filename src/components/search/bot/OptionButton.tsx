import React, { memo, useCallback } from 'react';

interface OptionButtonProps {
  label: string;
  onClick: () => void;
  icon?: string;
  isSelected?: boolean;
}

export const OptionButton = memo(function OptionButton({
  label,
  onClick,
  icon,
  isSelected
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all cursor-pointer shadow-3xs font-bold flex items-center gap-3"
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
});

interface OptionGridProps {
  options: Array<{ label: string; value: string | number; icon?: string }>;
  onSelect: (value: string | number) => void;
}

export const OptionGrid = memo(function OptionGrid({ options, onSelect }: OptionGridProps) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt) => (
        <OptionButton
          key={opt.value}
          label={opt.label}
          icon={opt.icon}
          onClick={() => onSelect(opt.value)}
        />
      ))}
    </div>
  );
});
