import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import apiClient from '../../utils/api';
import { toast } from 'sonner';

export function AIWizardModal({ isOpen, onClose, onApply }) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    coupleNames: '',
    hostNames: '',
    eventType: 'Wedding Ceremony',
    eventDate: '',
    eventTime: '',
    venue: '',
    culture: '',
    tone: 'Romantic & Elegant',
    language: 'English',
    colorMood: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const result = await apiClient.generateInvitationWizard(formData);
      if (result.success && result.draft) {
        toast.success('Invitation drafted successfully!');
        onApply(result.draft);
        onClose();
      } else {
        throw new Error('Failed to generate draft');
      }
    } catch (err) {
      toast.error(err.message || 'AI generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-center text-white">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-white/90" />
          <h2 className="text-xl font-bold tracking-wide">AI Setup Wizard</h2>
          <p className="mt-2 text-sm text-white/80">Answer a few questions and let AI build your invitation instantly.</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">1. Who & What</h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Couple Names</label>
                <input 
                  type="text" name="coupleNames" value={formData.coupleNames} onChange={handleChange} 
                  placeholder="e.g. Aaliyah & Omar" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Hosted By</label>
                <input 
                  type="text" name="hostNames" value={formData.hostNames} onChange={handleChange} 
                  placeholder="e.g. Mr. & Mrs. Smith (or 'Together with their families')" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Event Type</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100">
                  <option value="Wedding Ceremony">Wedding Ceremony</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Reception">Reception</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Save The Date">Save The Date</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">2. When & Where</h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <input 
                  type="text" name="eventDate" value={formData.eventDate} onChange={handleChange} 
                  placeholder="e.g. December 18, 2026" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Time</label>
                <input 
                  type="text" name="eventTime" value={formData.eventTime} onChange={handleChange} 
                  placeholder="e.g. 4:00 PM" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Venue / Location</label>
                <input 
                  type="text" name="venue" value={formData.venue} onChange={handleChange} 
                  placeholder="e.g. The Grand Hotel, New York" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">3. Vibe & Style</h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Culture / Tradition</label>
                <input 
                  type="text" name="culture" value={formData.culture} onChange={handleChange} 
                  placeholder="e.g. Christian, Islamic, Hindu, Modern Western" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Writing Tone</label>
                <select name="tone" value={formData.tone} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100">
                  <option value="Romantic & Elegant">Romantic & Elegant</option>
                  <option value="Formal Islamic/Nikah">Formal Islamic/Nikah</option>
                  <option value="Formal & Traditional">Formal & Traditional</option>
                  <option value="Modern Casual">Modern Casual</option>
                  <option value="Casual & Fun">Casual & Fun</option>
                  <option value="Poetic">Poetic</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Color Mood</label>
                <input 
                  type="text" name="colorMood" value={formData.colorMood} onChange={handleChange} 
                  placeholder="e.g. Emerald and Gold, Soft Pastels, Dark Moody" 
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100" 
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">Language</label>
                <select name="language" value={formData.language} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100">
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Bilingual (English & Arabic)">Bilingual (English & Arabic)</option>
                  <option value="Bilingual (English & Urdu)">Bilingual (English & Urdu)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", step >= i ? "bg-purple-500" : "bg-slate-200")} />
            ))}
          </div>

          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={handleBack} disabled={generating}
                className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button 
                onClick={handleNext}
                disabled={!formData.coupleNames && step === 1}
                className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? 'Drafting...' : 'Build Invitation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
