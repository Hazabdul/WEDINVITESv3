import React from 'react';
import { cn } from '../../utils/cn';

export function Button({ children, onClick, variant = 'primary', className, disabled, ...props }) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
