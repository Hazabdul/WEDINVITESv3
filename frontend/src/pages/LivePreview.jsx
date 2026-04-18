import React, { useState } from 'react';
import { useInvitationState } from '../hooks/useInvitationState';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { templatesList } from '../data/mockData';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Smartphone, ZoomIn, ZoomOut } from 'lucide-react';

export function LivePreview() {
  const { data, setTemplate } = useInvitationState();
  const [previewMode, setPreviewMode] = useState('desktop');
  const [zoom, setZoom] = useState(100);
  const previewTheme = data.theme?.id || templatesList[0].id;

  const iPhoneFrame = (content) => (
    <div className="relative origin-top shrink-0" style={{ transform: `scale(${zoom / 100})` }}>
      <div
        className="relative rounded-[54px] shadow-[0_0_0_2px_#8a8a8e,0_0_0_4px_#b0b0b6,0_30px_60px_-10px_rgba(0,0,0,0.6)]"
        style={{ width: 393, background: 'linear-gradient(145deg,#2a2a2c,#1c1c1e,#36363a)', padding: 14 }}
      >
        <div className="absolute -left-[3px] top-[120px] h-12 w-[3px] rounded-l-sm bg-gradient-to-r from-[#8a8a8e] to-[#636366]" />
        <div className="absolute -left-[3px] top-[185px] h-12 w-[3px] rounded-l-sm bg-gradient-to-r from-[#8a8a8e] to-[#636366]" />
        <div className="absolute -left-[3px] top-[72px] h-10 w-[3px] rounded-l-sm bg-gradient-to-r from-[#636366] to-[#48484a]" />
        <div className="absolute -right-[3px] top-[140px] h-16 w-[3px] rounded-r-sm bg-gradient-to-l from-[#8a8a8e] to-[#636366]" />

        <div className="relative overflow-hidden bg-white" style={{ borderRadius: 44, minHeight: 852 }}>
          <div className="absolute inset-x-0 top-3 z-50 flex justify-center">
            <div className="flex items-center gap-2 bg-black px-4" style={{ borderRadius: 20, height: 36, width: 126 }}>
              <div className="flex h-3 w-3 items-center justify-center rounded-full border border-[#2c2c2e] bg-[#1c1c1e]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#38383a]" />
              </div>
              <div className="h-1 flex-1 rounded-full bg-[#2c2c2e]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#2c2c2e]" />
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-8 pb-1 pt-2">
            <span className="text-[11px] font-semibold text-black/80">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex h-3 items-end gap-[2px]">
                {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: 3 + i * 2 }} className="w-0.5 rounded-sm bg-black" />)}
              </div>
              <div className="ml-0.5 h-3 w-3 rounded-sm bg-black opacity-80" />
              <div className="ml-0.5 h-2.5 w-5 rounded-[3px] border border-black/60 p-0.5">
                <div className="h-full w-3/4 rounded-[2px] bg-black" />
              </div>
            </div>
          </div>

          <div className="relative overflow-auto pt-14" style={{ minHeight: 852 }}>
            {content}
          </div>

          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <div className="h-1 w-32 rounded-full bg-black/30" />
          </div>
        </div>
      </div>
    </div>
  );

  const desktopFrame = (content) => (
    <div
      className="relative origin-top overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]"
      style={{ transform: `scale(${zoom / 100})` }}
    >
      {content}
    </div>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#f8fafc_42%,#eef1f7_100%)] px-4 py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/builder" className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 shadow-sm transition-colors hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Builder
          </Link>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1 text-xs shadow-sm">
            <button onClick={() => setZoom((z) => Math.max(z - 10, 30))} className="rounded-xl p-2 transition hover:bg-slate-100"><ZoomOut className="h-4 w-4" /></button>
            <span className="w-12 text-center font-semibold text-slate-600">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(z + 10, 200))} className="rounded-xl p-2 transition hover:bg-slate-100"><ZoomIn className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">Live Preview</h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">Use this page as the full preview canvas. Switch templates and device modes without being constrained by the builder layout.</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={cn('inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                  previewMode === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50')}
              >
                <Monitor className="h-4 w-4" /> Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={cn('inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                  previewMode === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50')}
              >
                <Smartphone className="h-4 w-4" /> Mobile
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-500">Current theme: <span className="font-semibold text-slate-800">{templatesList.find((tpl) => tpl.id === previewTheme)?.name}</span></div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
          {templatesList.map(tpl => (
            <button 
              key={tpl.id}
              onClick={() => setTemplate(tpl.id)}
              className={cn("px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all border outline-none", 
                  previewTheme === tpl.id 
                    ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105" 
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow"
              )}
            >
              {tpl.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex min-h-[880px] w-full max-w-[1400px] items-start justify-center overflow-auto rounded-[36px] border border-slate-200 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] [background-size:24px_24px]">
        <div data-design-surface="true" className="relative">
          {previewMode === 'mobile'
            ? iPhoneFrame(<TemplateRenderer type={previewTheme} data={data} key={`${previewTheme}-mobile`} />)
            : desktopFrame(<TemplateRenderer type={previewTheme} data={data} key={`${previewTheme}-desktop`} />)}
        </div>
      </div>
    </div>
  );
}
