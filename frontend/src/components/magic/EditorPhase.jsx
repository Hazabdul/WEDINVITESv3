import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor, Smartphone, Tablet, Eye, EyeOff, Send, Sparkles,
  Undo2, Redo2, ChevronLeft, ExternalLink, Share2, Loader2,
  RotateCcw, Check, Wand2,
} from 'lucide-react';
import { TemplateRenderer } from '../preview/TemplateRenderer';

const SECTIONS = [
  { id: 'hero',      label: 'Hero Cover',       always: true },
  { id: 'countdown', label: 'Countdown Timer',  themeKey: 'showCountdown' },
  { id: 'portraits', label: 'Couple Portraits', themeKey: 'showPortraits' },
  { id: 'video',     label: 'Video Story',      themeKey: 'showVideo' },
  { id: 'schedule',  label: 'Event Schedule',   themeKey: 'showSchedule' },
  { id: 'gallery',   label: 'Gallery',          themeKey: 'showGallery' },
  { id: 'map',       label: 'Venue & Map',      themeKey: 'showMap' },
  { id: 'rsvp',      label: 'RSVP Form',        themeKey: 'showRSVP' },
];

const EDIT_CHIPS = [
  'More luxury & gold', 'Dark elegant colors', 'Minimal & clean',
  'Romantic floral', 'Add Arabic style', 'Lighter pastel',
  'Cinematic dark', 'Smooth animations',
];

const DEVICES = [
  { id: 'mobile',  label: 'Mobile',  icon: Smartphone },
  { id: 'tablet',  label: 'Tablet',  icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
];

function SectionRow({ section, active, onToggle }) {
  const isOn = active;
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#f4f0ec] transition-colors group">
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold truncate ${isOn ? 'text-[#111]' : 'text-[#aaa]'}`}>
          {section.label}
        </p>
      </div>
      {!section.always && (
        <button
          onClick={onToggle}
          className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full transition-all ${
            isOn ? 'bg-[#111] text-white' : 'bg-[#eee] text-[#bbb] hover:bg-[#ddd]'
          }`}
          title={isOn ? 'Hide section' : 'Show section'}
        >
          {isOn ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
        </button>
      )}
      {section.always && (
        <div className="flex-shrink-0 flex h-5 w-5 items-center justify-center">
          <Check className="h-3 w-3 text-[#D4A76A]" />
        </div>
      )}
    </div>
  );
}

function DeviceFrame({ device, children }) {
  if (device === 'mobile') {
    return (
      <div className="mx-auto" style={{ width: 375 }}>
        <div className="rounded-[42px] border-[10px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 flex justify-center pt-2.5 z-20 pointer-events-none">
            <div className="h-5 w-28 rounded-full bg-[#1a1a1a]" />
          </div>
          <div className="overflow-y-auto rounded-[32px] bg-white" style={{ height: 680 }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
  if (device === 'tablet') {
    return (
      <div className="mx-auto" style={{ width: 620 }}>
        <div className="rounded-[28px] border-[8px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
          <div className="overflow-y-auto bg-white rounded-[20px]" style={{ height: 700 }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
  // desktop
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <div className="rounded-t-xl border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <div className="overflow-y-auto bg-white" style={{ height: 600 }}>
          {children}
        </div>
      </div>
      <div className="h-3 w-[106%] -ml-[3%] bg-[#2a2a2a] rounded-b-xl border-t border-white/5" />
    </div>
  );
}

export function EditorPhase({
  invitationData,
  messages,
  onUpdateTheme,
  onReset,
  onPublish,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isPublishing,
  isEditing,
  autoSavedAt,
  editPrompt,
  setEditPrompt,
  onEdit,
}) {
  const [device, setDevice] = useState('mobile');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isSectionOn = (section) => {
    if (section.always) return true;
    return invitationData?.theme?.[section.themeKey] !== false;
  };

  const toggleSection = (section) => {
    if (!section.themeKey) return;
    onUpdateTheme(section.themeKey, invitationData?.theme?.[section.themeKey] !== false ? false : true);
  };

  const openInNewTab = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write('<html><body style="margin:0"><div id="root"></div></body></html>');
      w.document.close();
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f4f0ec] overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="flex items-center gap-2 sm:gap-4 bg-white border-b border-[#eaeaea] px-3 sm:px-5 py-3 z-30 flex-shrink-0">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111] transition-colors flex-shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New</span>
        </button>

        <div className="h-4 w-px bg-[#eaeaea] flex-shrink-0" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-[#666] transition-all hover:bg-[#f4f0ec] disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-[#666] transition-all hover:bg-[#f4f0ec] disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-[#eaeaea] flex-shrink-0 hidden sm:block" />

        {/* Device toggle */}
        <div className="hidden sm:flex items-center gap-0.5 rounded-xl bg-[#f4f0ec] p-1 flex-shrink-0">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              title={label}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
                device === id ? 'bg-white text-[#111] shadow-sm' : 'text-[#999] hover:text-[#666]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auto-saved */}
        {autoSavedAt && (
          <p className="hidden lg:block text-[10px] text-[#aaa] flex-shrink-0">
            Auto-saved {autoSavedAt}
          </p>
        )}

        {/* Publish */}
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4A76A] to-[#B68D40] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-md transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 flex-shrink-0"
        >
          {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isPublishing ? 'Publishing…' : 'Publish & Share'}</span>
        </button>
      </header>

      {/* ── MAIN 3-PANEL BODY ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT PANEL — Sections + Chat */}
        <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 bg-white border-r border-[#eaeaea] overflow-hidden">
          {/* Sections */}
          <div className="flex-shrink-0 border-b border-[#eaeaea] px-4 py-4">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#aaa] mb-3">Website Sections</p>
            <div className="space-y-0.5">
              {SECTIONS.map((s) => (
                <SectionRow
                  key={s.id}
                  section={s}
                  active={isSectionOn(s)}
                  onToggle={() => toggleSection(s)}
                />
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <div className="flex flex-col flex-1 min-h-0 px-3 py-3">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#aaa] mb-3 flex-shrink-0">
              <Wand2 className="inline h-3 w-3 mr-1" />AI Editor
            </p>
            <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] rounded-[16px] px-3 py-2 text-[12px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-[#111] text-white'
                        : 'rounded-bl-sm bg-[#f4f0ec] text-[#333] border border-[#ebe5df]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isEditing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-[16px] rounded-bl-sm border border-[#ebe5df] bg-[#f4f0ec] px-3 py-2 text-[12px] text-[#666]">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#D4A76A]" />
                    Updating…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Edit Chips */}
            <div className="flex-shrink-0 pt-2 border-t border-[#eaeaea]">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {EDIT_CHIPS.slice(0, 4).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setEditPrompt(chip)}
                    className="rounded-full border border-[#eaeaea] px-2.5 py-1 text-[10px] text-[#666] hover:bg-[#111] hover:text-white hover:border-[#111] transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#eaeaea] bg-[#fcfbf9] px-2 pr-1 shadow-sm">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onEdit()}
                  placeholder="Ask AI to change anything…"
                  className="flex-1 bg-transparent py-2 text-[12px] text-[#111] outline-none placeholder:text-[#bbb] min-w-0"
                />
                <button
                  onClick={onEdit}
                  disabled={isEditing || !editPrompt.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111] text-white transition-colors hover:bg-black disabled:opacity-30"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER — Preview */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start py-8 px-4 gap-6">
          {/* Mobile device toggle */}
          <div className="sm:hidden flex items-center gap-1 rounded-xl bg-white border border-[#eaeaea] p-1">
            {DEVICES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setDevice(id)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  device === id ? 'bg-[#111] text-white' : 'text-[#999]'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {invitationData && (
            <DeviceFrame device={device}>
              <TemplateRenderer
                type={invitationData.theme?.id || 'classic'}
                data={invitationData}
                isPreview={true}
                previewMode={device}
              />
            </DeviceFrame>
          )}
        </main>

        {/* RIGHT PANEL — Quick Edits (desktop only) */}
        <aside className="hidden xl:flex flex-col w-[260px] flex-shrink-0 bg-white border-l border-[#eaeaea] overflow-y-auto p-4 gap-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#aaa] mb-3">Quick Edits</p>
            <div className="flex flex-wrap gap-2">
              {EDIT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => { setEditPrompt(chip); onEdit(); }}
                  className="rounded-full border border-[#eaeaea] px-3 py-1.5 text-[11px] font-medium text-[#666] hover:bg-[#111] hover:text-white hover:border-[#111] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#eaeaea] pt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#aaa] mb-3">Section Visibility</p>
            <div className="space-y-1">
              {SECTIONS.filter((s) => !s.always).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1.5">
                  <span className="text-[12px] text-[#555]">{s.label}</span>
                  <button
                    onClick={() => toggleSection(s)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      isSectionOn(s) ? 'bg-[#111]' : 'bg-[#ddd]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        isSectionOn(s) ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#eaeaea] pt-4 mt-auto">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 rounded-full border border-[#eaeaea] py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#999] hover:text-red-500 hover:border-red-200 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start Over
            </button>
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM — AI chat bar */}
      <div className="lg:hidden flex-shrink-0 bg-white border-t border-[#eaeaea] px-3 py-3">
        <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-1">
          {EDIT_CHIPS.slice(0, 6).map((chip) => (
            <button
              key={chip}
              onClick={() => setEditPrompt(chip)}
              className="flex-shrink-0 rounded-full border border-[#eaeaea] px-3 py-1.5 text-[11px] text-[#666] hover:bg-[#111] hover:text-white transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#eaeaea] bg-[#fcfbf9] px-3 pr-1.5">
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onEdit()}
            placeholder="Ask AI to change anything…"
            className="flex-1 bg-transparent py-2.5 text-[13px] text-[#111] outline-none placeholder:text-[#bbb]"
          />
          <button
            onClick={onEdit}
            disabled={isEditing || !editPrompt.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-white disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
