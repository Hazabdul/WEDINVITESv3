import React from 'react';
import { cn } from '../../utils/cn';

export function Stepper({ steps, currentStep, onStepChange, progressInfo }) {
  const percentage = progressInfo?.percentage ?? 0;
  const missingFields = progressInfo?.missingFields ?? [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur mb-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Builder progress</p>
          <h2 className="text-xl font-semibold text-slate-900">{steps[currentStep]}</h2>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">{percentage}%</div>
          <p className="text-xs text-slate-500">Completion</p>
        </div>
      </div>
      
      <div className="mb-3 h-3 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", percentage === 100 ? "bg-emerald-500" : "bg-slate-900")}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {missingFields.length > 0 ? (
         <div className="mb-5 text-[11px] font-medium text-amber-600 leading-tight">
           <span className="font-bold">Missing Info:</span> {missingFields.join(", ")}
         </div>
      ) : (
         <div className="mb-5 text-sm font-semibold text-emerald-600">
           🎉 Excellent! All required details are filled.
         </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        {steps.map((step, index) => (
          <button
            type="button"
            key={step}
            onClick={() => onStepChange && onStepChange(index)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-medium truncate text-center cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95 select-none",
              index === currentStep
                ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : index < currentStep
                ? "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50"
            )}
            title={step}
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>
    </div>
  );
}
