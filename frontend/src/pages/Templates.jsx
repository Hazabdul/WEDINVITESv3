import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Eye, Layers3, Sparkles, Star } from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { templatesList } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { cn } from '../utils/cn';

function PreviewShell({ children, tint }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/60 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
      <div className={cn("absolute inset-x-0 top-0 h-28 bg-gradient-to-r opacity-80", tint)} />
      <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-700 backdrop-blur-md">
        <Eye className="h-3.5 w-3.5" />
        Live preview
      </div>
      <div className="relative p-4 pt-14">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <div className="ml-3 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-slate-500">
              Guest experience
            </div>
          </div>
          <div className="aspect-[16/11] overflow-hidden bg-white">
            <div className="origin-top-left scale-[0.45]" style={{ width: '222.2%' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, data, selected, onSelect }) {
  const previewData = {
    ...data,
    theme: {
      ...data.theme,
      id: template.id,
    },
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[36px] border bg-white/80 backdrop-blur-sm transition-all duration-500",
        "shadow-[0_18px_60px_rgba(15,23,42,0.08)] hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(15,23,42,0.14)]",
        selected ? "border-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.18)]" : "border-white/70"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90" />
      <div className="space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              {template.badge}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{template.name}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{template.tagline}</p>
          </div>

          <div className={cn("rounded-[28px] border border-white/70 bg-gradient-to-br p-4 text-right shadow-inner", template.palette)}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">Mood</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{template.mood}</div>
          </div>
        </div>

        <PreviewShell tint={template.accent}>
          <TemplateRenderer type={template.id} data={previewData} />
        </PreviewShell>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">What makes it premium</div>
            <div className="flex flex-wrap gap-2">
              {template.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button
              onClick={onSelect}
              className="justify-center rounded-[22px] bg-slate-950 px-6 py-3.5 text-sm font-semibold shadow-[0_20px_40px_rgba(15,23,42,0.18)] hover:bg-slate-800"
            >
              Use This Template
              <ArrowRight className="h-4 w-4" />
            </Button>
            {selected && (
              <div className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                Active in builder
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function Templates() {
  const navigate = useNavigate();
  const { data, setTemplate } = useInvitationState();

  const handleSelectTemplate = (id) => {
    setTemplate(id);
    navigate('/builder');
  };

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#f7f2ea_0%,#fcfbf8_40%,#f4f6fb_100%)]">
      <div className="absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute right-[-80px] top-44 h-80 w-80 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_70%)]" />

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Premium template gallery
            </div>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
              Choose the template guests will remember.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Each theme is rendered from the real invitation engine, not a static mock card. Pick the visual direction, then refine every detail inside the builder.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">Templates</div>
              <div className="mt-3 text-4xl font-semibold text-slate-950">{templatesList.length}</div>
              <p className="mt-2 text-sm text-slate-600">Distinct premium directions for different wedding aesthetics.</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-400">Rendered</div>
              <div className="mt-3 text-4xl font-semibold text-slate-950">Live</div>
              <p className="mt-2 text-sm text-slate-600">Preview cards show the actual experience, not abstract placeholders.</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-slate-950 p-5 text-white shadow-[0_18px_60px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-white/55">
                <Layers3 className="h-4 w-4" />
                Workflow
              </div>
              <div className="mt-3 text-2xl font-semibold">Pick now, customize later</div>
              <p className="mt-2 text-sm leading-6 text-white/65">You can switch themes inside the builder without losing your content.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl space-y-8 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        {templatesList.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            data={data}
            selected={data?.theme?.id === template.id}
            onSelect={() => handleSelectTemplate(template.id)}
          />
        ))}
      </section>
    </main>
  );
}
