import React from 'react';
import { cn } from '../../utils/cn';

export function Input({ label, value, onChange, placeholder, type = "text", className }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
      />
    </label>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 4, className }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange, className }) {
  return (
    <div className={cn("flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={cn(
          "relative h-7 w-12 rounded-full transition",
          checked ? "bg-slate-900" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white transition",
            checked ? "left-6" : "left-1"
          )}
        />
      </button>
    </div>
  );
}

export function Select({ label, value, onChange, options, className }) {
  return (
    <label className={cn("block space-y-2", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900 appearance-none pr-10 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </label>
  );
}
