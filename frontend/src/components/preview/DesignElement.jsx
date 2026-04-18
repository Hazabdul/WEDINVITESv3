import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInvitationState } from '../../hooks/useInvitationState';
import { cn } from '../../utils/cn';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function DesignElement({ id, label, children, defaultColor }) {
  const {
    data,
    updatePosition,
    registerDesignElement,
    unregisterDesignElement,
    selectedDesignElement,
    setSelectedDesignElement,
  } = useInvitationState();

  const isDesignMode = !!data.theme?.enableDesignMode;
  const saved = data.positions?.[id];
  const elRef = useRef(null);
  const dragState = useRef(null);
  const [draft, setDraft] = useState(null);
  const liveState = useRef({
    x: saved?.x ?? null,
    y: saved?.y ?? null,
    scale: saved?.scale ?? 1,
    color: saved?.color ?? defaultColor ?? '',
  });
  const selected = selectedDesignElement === id;
  const resolved = {
    x: draft?.x ?? saved?.x ?? null,
    y: draft?.y ?? saved?.y ?? null,
    scale: draft?.scale ?? saved?.scale ?? 1,
    color: draft?.color ?? saved?.color ?? defaultColor ?? '',
  };

  useEffect(() => {
    liveState.current = {
      x: resolved.x,
      y: resolved.y,
      scale: resolved.scale,
      color: resolved.color,
    };
  }, [resolved.x, resolved.y, resolved.scale, resolved.color]);

  const meta = useMemo(() => ({
    id,
    label: label || id,
    color: resolved.color || defaultColor || '',
    scale: resolved.scale,
    positioned: resolved.x != null && resolved.y != null,
  }), [id, label, resolved.color, defaultColor, resolved.scale, resolved.x, resolved.y]);

  useEffect(() => {
    if (!isDesignMode) return undefined;
    registerDesignElement(id, meta);
    return () => unregisterDesignElement(id);
  }, [id, meta, isDesignMode, registerDesignElement, unregisterDesignElement]);

  useEffect(() => {
    if (!isDesignMode && selected) {
      setSelectedDesignElement(null);
    }
  }, [isDesignMode, selected, setSelectedDesignElement]);

  useEffect(() => {
    if (!selected) return undefined;

    const handlePointerUp = () => {
      dragState.current = null;
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [selected]);

  const commitState = (next) => {
    updatePosition(id, next);
    registerDesignElement(id, {
      label: label || id,
      color: next.color ?? resolved.color ?? defaultColor ?? '',
      scale: next.scale ?? resolved.scale,
      positioned: next.x != null && next.y != null,
    });
  };

  const handlePointerDown = (event) => {
    if (!isDesignMode) return;

    event.stopPropagation();
    event.preventDefault();
    setSelectedDesignElement(id);

    const offsetParent = elRef.current?.offsetParent;
    const surface = elRef.current?.closest('[data-design-surface="true"]');
    const surfaceRect = (offsetParent instanceof HTMLElement ? offsetParent : surface)?.getBoundingClientRect();
    const elementRect = elRef.current?.getBoundingClientRect();

    if (!surfaceRect || !elementRect) return;

    dragState.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: resolved.x ?? (elementRect.left - surfaceRect.left),
      startY: resolved.y ?? (elementRect.top - surfaceRect.top),
      surfaceWidth: surfaceRect.width,
      surfaceHeight: surfaceRect.height,
      elementWidth: elementRect.width,
      elementHeight: elementRect.height,
    };

    const handlePointerMove = (moveEvent) => {
      if (!dragState.current) return;

      const nextX = dragState.current.startX + (moveEvent.clientX - dragState.current.pointerX);
      const nextY = dragState.current.startY + (moveEvent.clientY - dragState.current.pointerY);

      setDraft((prev) => ({
        ...(prev || liveState.current),
        x: clamp(nextX, 0, Math.max(0, dragState.current.surfaceWidth - dragState.current.elementWidth)),
        y: clamp(nextY, 0, Math.max(0, dragState.current.surfaceHeight - dragState.current.elementHeight)),
      }));
    };

    const handlePointerUp = () => {
      if (!dragState.current) return;
      const next = {
        x: liveState.current.x,
        y: liveState.current.y,
        scale: liveState.current.scale,
        color: liveState.current.color,
      };
      commitState(next);
      setDraft(null);
      dragState.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  const handleScaleChange = (delta) => {
    const nextScale = Math.round(clamp(resolved.scale + delta, 0.5, 2.4) * 10) / 10;
    commitState({ x: resolved.x, y: resolved.y, scale: nextScale, color: resolved.color });
  };

  const handleColorChange = (nextColor) => {
    commitState({ x: resolved.x, y: resolved.y, scale: resolved.scale, color: nextColor });
  };

  const handleReset = () => {
    setDraft(null);
    commitState({ x: null, y: null, scale: 1, color: defaultColor ?? '' });
  };

  if (!isDesignMode) {
    return (
      <span style={{ color: resolved.color || 'inherit', transform: `scale(${resolved.scale})`, display: 'inline-block' }}>
        {children}
      </span>
    );
  }

  return (
    <div
      ref={elRef}
      onPointerDown={handlePointerDown}
      className={cn(
        'group inline-block touch-none select-none rounded-lg',
        resolved.x != null && resolved.y != null ? 'absolute z-30' : 'relative z-10',
        selected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white/80' : 'hover:ring-2 hover:ring-dashed hover:ring-indigo-300/90'
      )}
      style={{
        ...(resolved.x != null && resolved.y != null ? { left: resolved.x, top: resolved.y } : {}),
        transform: `scale(${resolved.scale})`,
        transformOrigin: 'top left',
        color: resolved.color || 'inherit',
        cursor: 'grab',
      }}
    >
      {selected && (
        <div
          className="absolute -top-14 left-0 z-[100] flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-xl"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <label className="flex cursor-pointer items-center gap-1" title="Text color">
            <div className="h-5 w-5 rounded border border-slate-300" style={{ background: resolved.color || defaultColor || '#111827' }} />
            <input
              type="color"
              value={resolved.color || defaultColor || '#111827'}
              onChange={(event) => handleColorChange(event.target.value)}
              className="sr-only"
            />
          </label>
          <div className="h-5 w-px bg-slate-200" />
          <button onClick={() => handleScaleChange(-0.1)} className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200">-</button>
          <span className="w-9 text-center text-[11px] font-semibold text-slate-600">{Math.round(resolved.scale * 100)}%</span>
          <button onClick={() => handleScaleChange(0.1)} className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-sm font-bold text-slate-700 hover:bg-slate-200">+</button>
          <div className="h-5 w-px bg-slate-200" />
          <button onClick={handleReset} className="rounded px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50">
            Reset
          </button>
        </div>
      )}

      <div className="absolute -left-1.5 -top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="block h-3 w-3 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
      </div>

      {children}
    </div>
  );
}
