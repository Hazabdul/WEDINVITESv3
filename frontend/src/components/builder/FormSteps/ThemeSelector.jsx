import React from 'react';
import { Check, Palette, Sparkles } from 'lucide-react';
import { useInvitationState } from '../../../hooks/useInvitationState';
import { Card } from '../../ui/Card';
import { Toggle, Select } from '../../ui/FormElements';
import { templatesList } from '../../../data/mockData';
import { TemplateRenderer } from '../../preview/TemplateRenderer';
import { cn } from '../../../utils/cn';

function MiniPreview({ id, data }) {
  const previewData = {
    ...data,
    theme: {
      ...data.theme,
      id,
    },
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-300" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
        </div>
      </div>
      <div className="aspect-[10/12] overflow-hidden bg-slate-100">
        <div className="origin-top-left scale-[0.32]" style={{ width: '312.5%' }}>
          <TemplateRenderer type={id} data={previewData} />
        </div>
      </div>
    </div>
  );
}

export function ThemeSelector() {
  const { data, updateSection, setTemplate } = useInvitationState();
  const { theme } = data;

  return (
    <Card
      title="Template & Theme Customization"
      subtitle="Choose the invitation direction first, then tune the palette and behavior."
      icon={Palette}
      className="overflow-hidden border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))]"
    >
      <div className="mb-6 rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/55">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Curated premium directions
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
          These previews use the same renderer your guests will see. Pick the strongest visual language now and refine content, colors, and layout after.
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        {templatesList.map((tpl) => {
          const selected = theme.id === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setTemplate(tpl.id)}
              className={cn(
                "group overflow-hidden rounded-[28px] border text-left transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]",
                selected
                  ? "border-slate-900 bg-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
                  : "border-slate-200 bg-white"
              )}
            >
              <div className="p-3">
                <MiniPreview id={tpl.id} data={data} />
              </div>

              <div className={cn("space-y-3 border-t px-5 py-4", selected ? "border-white/10 text-white" : "border-slate-100 text-slate-900")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={cn("inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]", selected ? "bg-white/10 text-white/75" : "bg-slate-100 text-slate-500")}>
                      {tpl.badge}
                    </div>
                    <h4 className="mt-3 text-lg font-semibold">{tpl.name}</h4>
                    <p className={cn("mt-1 text-sm leading-6", selected ? "text-white/68" : "text-slate-600")}>{tpl.tagline}</p>
                  </div>

                  <div className={cn(
                    "mt-1 flex h-8 w-8 items-center justify-center rounded-full border",
                    selected ? "border-white/20 bg-white text-slate-950" : "border-slate-200 bg-slate-50 text-transparent"
                  )}>
                    <Check className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tpl.features.slice(0, 2).map((feature) => (
                    <span
                      key={feature}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        selected ? "border-white/10 bg-white/8 text-white/72" : "border-slate-200 bg-slate-50 text-slate-600"
                      )}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Primary Color</span>
          <input type="color" value={theme.primaryColor} onChange={(e) => updateSection("theme", "primaryColor", e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white p-1" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Secondary Color</span>
          <input type="color" value={theme.secondaryColor} onChange={(e) => updateSection("theme", "secondaryColor", e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white p-1" />
        </label>
        <Select
          label="Font Family"
          value={theme.font}
          onChange={(e) => updateSection("theme", "font", e.target.value)}
          options={[
            { value: "serif", label: "Playfair (Elegant Serif)" },
            { value: "sans", label: "Inter (Clean Sans)" },
            { value: "mono", label: "Fira Code (Modern Mono)" },
          ]}
        />
        <Select
          label="Background Style"
          value={theme.backgroundStyle}
          onChange={(e) => updateSection("theme", "backgroundStyle", e.target.value)}
          options={[
            { value: "solid", label: "Solid Color" },
            { value: "soft-gradient", label: "Soft Gradient" },
            { value: "pattern", label: "Subtle Pattern" },
          ]}
        />
        <Select
          label="Border Style"
          value={theme.borderStyle}
          onChange={(e) => updateSection("theme", "borderStyle", e.target.value)}
          options={[
            { value: "none", label: "No Borders" },
            { value: "rounded", label: "Rounded Borders" },
            { value: "sharp", label: "Sharp Borders" },
          ]}
        />
        <Select
          label="Section Shape"
          value={theme.sectionShape}
          onChange={(e) => updateSection("theme", "sectionShape", e.target.value)}
          options={[
            { value: "rounded-none", label: "Square" },
            { value: "rounded-lg", label: "Slight Radius" },
            { value: "rounded-3xl", label: "Large Radius (Pill)" },
          ]}
        />
      </div>

      <div className="mb-6 mt-6 border-t pt-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-indigo-100 bg-[linear-gradient(135deg,#eef2ff_0%,#ffffff_100%)] p-4 sm:flex-row sm:items-center">
          <div>
            <h4 className="flex items-center gap-2 font-bold text-indigo-900">
              Interactive Design Mode
              <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">New</span>
            </h4>
            <p className="mt-1 text-sm text-indigo-700/80">
              Turn this on to drag content blocks around and tune the composition directly in the preview canvas.
            </p>
          </div>
          <Toggle label="" checked={theme.enableDesignMode} onChange={() => updateSection("theme", "enableDesignMode", !theme.enableDesignMode)} className="w-[100px] shrink-0 border-indigo-200 bg-white" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Toggle label="Enable Animation" checked={theme.enableAnimation} onChange={() => updateSection("theme", "enableAnimation", !theme.enableAnimation)} />
        <Toggle label="Enable Countdown" checked={theme.enableCountdown} onChange={() => updateSection("theme", "enableCountdown", !theme.enableCountdown)} />
        <Toggle label="Enable Gallery" checked={theme.enableGallery} onChange={() => updateSection("theme", "enableGallery", !theme.enableGallery)} />
        <Toggle label="Enable Video" checked={theme.enableVideo} onChange={() => updateSection("theme", "enableVideo", !theme.enableVideo)} />
      </div>
    </Card>
  );
}
