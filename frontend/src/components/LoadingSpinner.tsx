import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin-smooth`}
        style={{
          borderColor: 'var(--border-default)',
          borderTopColor: 'var(--brand-text)',
        }}
      />
      {text && (
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {text}
        </p>
      )}
    </div>
  );
};
