import React, { useRef } from 'react';
import { Image as ImageIcon, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';

const WEDDING_STYLES = [
  { id: 'classic',   label: 'Classic',   emoji: '🕊',  bg: '#f7f4ef' },
  { id: 'luxury',    label: 'Luxury',    emoji: '👑',  bg: '#fdf8ee' },
  { id: 'floral',    label: 'Floral',    emoji: '🌸',  bg: '#fdf0f5' },
  { id: 'modern',    label: 'Modern',    emoji: '◆',   bg: '#f4f4f6' },
  { id: 'arabic',    label: 'Arabic',    emoji: '☽',   bg: '#f3f0ea' },
  { id: 'beach',     label: 'Beach',     emoji: '🌊',  bg: '#eef6f9' },
  { id: 'minimal',   label: 'Minimal',   emoji: '○',   bg: '#f8f8f8' },
  { id: 'cinematic', label: 'Dark',      emoji: '✦',   bg: '#1e1e1e', dark: true },
];

const TONES = ['Romantic', 'Formal', 'Islamic', 'Modern', 'Playful', 'Poetic'];

export function InputPhase({ formState, setFormState, files, setFiles, onGenerate, onOpenWizard, isGenerating, isUploading }) {
  const fileInputRef = useRef(null);

  const update = (key, val) => setFormState((p) => ({ ...p, [key]: val }));

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((p) => [...p, ...picked].slice(0, 10));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'));
    setFiles((p) => [...p, ...dropped].slice(0, 10));
  };

  const removeFile = (i) => setFiles((p) => p.filter((_, idx) => idx !== i));

  const canGenerate = (formState.bride || formState.groom) && formState.email && !isGenerating && !isUploading;

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col lg:flex-row">
      {/* ── LEFT BRANDING PANEL (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-[#111] text-white p-12 sticky top-0 h-screen">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 mb-10">
            <Sparkles className="h-5 w-5 text-[#D4A76A]" />
          </div>
          <h1 className="font-serif text-[38px] italic leading-[1.1] tracking-tight mb-4">
            AI Wedding<br />Invitation Builder
          </h1>
          <p className="text-[14px] text-white/50 leading-relaxed max-w-[300px]">
            Describe your dream wedding, upload your photos, and our AI will craft a stunning digital invitation in seconds.
          </p>
        </div>

        <div className="space-y-4">
          {[
            ['30 seconds', 'to generate a full invitation'],
            ['8 templates', 'classic, luxury, floral & more'],
            ['Instant link', 'share on WhatsApp or social media'],
          ].map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#D4A76A] flex-shrink-0" />
              <div>
                <span className="text-[12px] font-bold text-white">{title}</span>
                <span className="text-[12px] text-white/40"> — {desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 overflow-y-auto px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-xl mx-auto space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111]">
              <Sparkles className="h-4 w-4 text-[#D4A76A]" />
            </div>
            <h1 className="font-serif text-[24px] italic text-[#111]">AI Invitation Builder</h1>
          </div>

          {/* Style Picker */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-3">
              Wedding Style <span className="text-[#D4A76A]">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {WEDDING_STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => update('style', s.id)}
                  style={{ background: s.bg }}
                  className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl p-3 sm:p-4 border-2 transition-all duration-200 ${
                    formState.style === s.id
                      ? 'border-[#D4A76A] shadow-[0_0_0_4px_rgba(212,167,106,0.15)]'
                      : 'border-transparent hover:border-[#D4A76A]/30'
                  }`}
                >
                  <span className="text-[20px] sm:text-[22px] leading-none">{s.emoji}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${s.dark ? 'text-white/70' : 'text-[#666]'}`}>
                    {s.label}
                  </span>
                  {formState.style === s.id && (
                    <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#D4A76A]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Picker */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-3">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => update('tone', t)}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    formState.tone === t
                      ? 'bg-[#111] text-white shadow-sm'
                      : 'border border-[#eaeaea] text-[#666] hover:border-[#111] hover:text-[#111]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-1.5">Bride Name</label>
              <input
                value={formState.bride}
                onChange={(e) => update('bride', e.target.value)}
                placeholder="Aaliyah"
                className="w-full rounded-xl border border-[#eaeaea] bg-white px-3.5 py-2.5 text-[13px] text-[#111] focus:outline-none focus:border-[#D4A76A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-1.5">Groom Name</label>
              <input
                value={formState.groom}
                onChange={(e) => update('groom', e.target.value)}
                placeholder="Omar"
                className="w-full rounded-xl border border-[#eaeaea] bg-white px-3.5 py-2.5 text-[13px] text-[#111] focus:outline-none focus:border-[#D4A76A] transition-colors"
              />
            </div>
          </div>

          {/* Date + Venue */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-1.5">Wedding Date</label>
              <input
                type="date"
                value={formState.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full rounded-xl border border-[#eaeaea] bg-white px-3.5 py-2.5 text-[13px] text-[#111] focus:outline-none focus:border-[#D4A76A] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-1.5">City / Venue</label>
              <input
                value={formState.venue}
                onChange={(e) => update('venue', e.target.value)}
                placeholder="Riyadh"
                className="w-full rounded-xl border border-[#eaeaea] bg-white px-3.5 py-2.5 text-[13px] text-[#111] focus:outline-none focus:border-[#D4A76A] transition-colors"
              />
            </div>
          </div>

          {/* Extra details */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-1.5">
              Additional Details <span className="text-[#aaa] font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={formState.extra}
              onChange={(e) => update('extra', e.target.value)}
              placeholder="e.g. Gold and ivory color scheme, bilingual Arabic and English, outdoor garden setting…"
              rows={3}
              className="w-full rounded-xl border border-[#eaeaea] bg-white px-3.5 py-2.5 text-[13px] text-[#111] focus:outline-none focus:border-[#D4A76A] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-3">
              Upload Photos / Videos
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#eaeaea] bg-[#f9f7f5] p-8 cursor-pointer hover:border-[#D4A76A]/50 hover:bg-[#fdf9f5] transition-all text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-[#eaeaea] shadow-sm">
                <ImageIcon className="h-5 w-5 text-[#876c57]" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#111]">Drop photos here or click to browse</p>
                <p className="text-[11px] text-[#999] mt-0.5">Couple photos, venue, backgrounds — up to 10 files</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFiles} />
            </div>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  const isVid = f.type.startsWith('video/');
                  return (
                    <div key={i} className="relative group h-16 w-16 rounded-xl overflow-hidden border border-[#eaeaea] shadow-sm">
                      {isVid ? (
                        <video src={url} className="h-full w-full object-cover" muted />
                      ) : (
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      )}
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute top-0.5 right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#111] mb-1.5">
              Your Email <span className="text-[#D4A76A]">*</span>
            </label>
            <input
              type="email"
              value={formState.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-[#eaeaea] bg-white px-3.5 py-2.5 text-[13px] text-[#111] focus:outline-none focus:border-[#D4A76A] transition-colors"
            />
            <p className="mt-1.5 text-[10px] text-[#aaa]">We'll send your invitation link here after publishing.</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onOpenWizard}
              className="w-full rounded-2xl border border-[#eaeaea] bg-white py-3.5 text-[12px] font-black uppercase tracking-[0.25em] text-[#111] transition-all hover:border-[#111] hover:bg-[#f9f8f6]"
            >
              Start guided setup
            </button>

            <button
              onClick={onGenerate}
              disabled={!canGenerate}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#111] py-4 text-[12px] font-black uppercase tracking-[0.25em] text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {isGenerating || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading photos…' : 'AI is designing your invitation…'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate My Invitation
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {!formState.bride && !formState.groom && (
            <p className="text-center text-[11px] text-[#bbb]">Fill in at least one name to get started</p>
          )}
        </div>
      </div>
    </div>
  );
}
