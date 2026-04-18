import React from 'react';
import {
  CheckCircle2,
  Eye,
  Layers3,
  MousePointer2,
  Move,
  Paintbrush,
  RotateCcw,
  Type,
} from 'lucide-react';
import { useInvitationState } from '../../hooks/useInvitationState';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

function formatLabelCount(count) {
  return `${count} editable ${count === 1 ? 'element' : 'elements'}`;
}

export function DragDropCanvas() {
  const {
    data,
    designRegistry,
    selectedDesignElement,
    setSelectedDesignElement,
    updatePosition,
  } = useInvitationState();

  const elements = Object.values(designRegistry);
  const selectedMeta = selectedDesignElement ? designRegistry[selectedDesignElement] : null;
  const selectedPosition = selectedDesignElement ? data.positions?.[selectedDesignElement] : null;

  const handleResetSelected = () => {
    if (!selectedDesignElement) return;
    updatePosition(selectedDesignElement, {
      x: null,
      y: null,
      scale: 1,
      color: selectedMeta?.color || '',
    });
  };

  const handleResetAll = () => {
    elements.forEach((element) => {
      updatePosition(element.id, {
        x: null,
        y: null,
        scale: 1,
        color: element.color || '',
      });
    });
    setSelectedDesignElement(null);
  };

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#0f1117_0%,#141827_100%)] text-white">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/45">
          <Layers3 className="h-4 w-4 text-indigo-300" />
          Preview editor
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-white">Edit the real invitation</h2>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Drag elements directly on the preview. This panel only lists components that are actually visible in the current template.
        </p>
      </div>

      <div className="border-b border-white/8 px-5 py-4">
        <div className="grid gap-3">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">Detected</div>
            <div className="mt-2 text-lg font-semibold text-white">{formatLabelCount(elements.length)}</div>
          </div>
          <div className="rounded-[22px] border border-indigo-400/20 bg-indigo-400/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
              <MousePointer2 className="h-4 w-4" />
              How it works
            </div>
            <p className="mt-2 text-xs leading-6 text-indigo-100/72">
              Click an item below to select it, then drag that content block on the live preview. Use the floating toolbar on the preview to scale, recolor, or reset it.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {elements.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-white/4 p-5 text-sm leading-6 text-white/45">
            Turn on `Interactive Design Mode` in the Theme step, then return here. The editor will populate with the elements rendered by the current template preview.
          </div>
        ) : (
          <div className="space-y-3">
            {elements.map((element) => {
              const isSelected = selectedDesignElement === element.id;
              return (
                <button
                  key={element.id}
                  type="button"
                  onClick={() => setSelectedDesignElement(element.id)}
                  className={cn(
                    "w-full rounded-[24px] border p-4 text-left transition-all",
                    isSelected
                      ? "border-indigo-400/40 bg-indigo-400/14 shadow-[0_16px_40px_rgba(99,102,241,0.18)]"
                      : "border-white/8 bg-white/5 hover:border-white/14 hover:bg-white/7"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-white">
                        <Type className="h-4 w-4 text-white/55" />
                        <span className="font-medium">{element.label}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-white/45">
                          <Eye className="h-3 w-3" />
                          Visible in preview
                        </span>
                        {element.positioned && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Positioned
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: element.color || '#ffffff' }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-white/8 px-5 py-4">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            <Paintbrush className="h-4 w-4" />
            Selected element
          </div>

          {selectedMeta ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="text-sm font-semibold text-white">{selectedMeta.label}</div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/55">
                  <span className="inline-flex items-center gap-1">
                    <Move className="h-3.5 w-3.5" />
                    x {Math.round(selectedPosition?.x ?? 0)} / y {Math.round(selectedPosition?.y ?? 0)}
                  </span>
                  <span>Scale {Math.round((selectedPosition?.scale ?? selectedMeta.scale ?? 1) * 100)}%</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Button onClick={handleResetSelected} variant="outline" className="justify-center border-white/12 bg-white/6 text-white hover:bg-white/10">
                  Reset Selected
                </Button>
                <Button onClick={handleResetAll} className="justify-center bg-white text-slate-950 hover:bg-slate-100">
                  <RotateCcw className="h-4 w-4" />
                  Reset All Positions
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-white/45">
              Select an item from the list, then drag it on the preview.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
