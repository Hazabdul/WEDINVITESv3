import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ title, subtitle, children, icon: Icon, className }) {
  return (
    <div className={cn("rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60", className)}>
      {(title || Icon) && (
        <div className="mb-5 flex items-start gap-3">
          {Icon && (
            <div className="rounded-2xl bg-slate-900 p-2 text-white">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
