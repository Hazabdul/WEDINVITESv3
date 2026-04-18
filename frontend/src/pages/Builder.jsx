import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvitationState } from '../hooks/useInvitationState';
import { Stepper } from '../components/builder/Stepper';
import { CoupleInfo } from '../components/builder/FormSteps/CoupleInfo';
import { EventDetails } from '../components/builder/FormSteps/EventDetails';
import { FamilyContent } from '../components/builder/FormSteps/FamilyContent';
import { MediaUpload } from '../components/builder/FormSteps/MediaUpload';
import { ThemeSelector } from '../components/builder/FormSteps/ThemeSelector';
import { DragDropCanvas } from '../components/builder/DragDropCanvas';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { Button } from '../components/ui/Button';
import apiClient from '../utils/api';
import {
  ChevronLeft, ChevronRight, Crown, Trash2,
  Monitor, Smartphone, ZoomIn, ZoomOut, Layers, Eye, CheckCircle, ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';

const STEPS = [
  'Couple Info',
  'Event Details',
  'Family + Content',
  'Media',
  'Theme',
  'Canvas Design',
  'Pricing',
];

export function Builder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [zoom, setZoom] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedInvitation, setPublishedInvitation] = useState(null);
  const { data, clearData } = useInvitationState();

  const next = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  const prev = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const calculateProgress = () => {
    const required = [
      data?.couple?.bride, data?.couple?.groom, data?.couple?.title,
      data?.event?.date, data?.event?.time, data?.event?.venue,
      data?.family?.brideParents, data?.family?.groomParents, data?.content?.rsvpText,
    ];
    const filled = required.filter((v) => v && String(v).trim() !== '').length;
    return { percentage: Math.round((filled / required.length) * 100) };
  };

  const handleSubmitInvitation = async () => {
    if (!data || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Step 1: Create a new invitation
      const created = await apiClient.createInvitation({});

      // Step 2: Update with all form data
      const invitationData = {
        brideName: data.couple?.bride || '',
        groomName: data.couple?.groom || '',
        weddingDate: data.event?.date ? new Date(data.event.date) : null,
        couple: data.couple || {},
        event: data.event || {},
        family: data.family || {},
        content: data.content || {},
        theme: data.theme || { templateId: 'classic' },
        media: data.media || { gallery: [] },
        positions: data.positions || {},
      };

      await apiClient.updateInvitation(created._id, invitationData);

      // Step 3: Publish the invitation
      const published = await apiClient.publishInvitation(created._id);

      // Step 4: Set the published invitation with the shareable link
      setPublishedInvitation({
        id: created._id,
        slug: published.slug,
        shareUrl: `${window.location.origin}/invitation/${published.slug}`,
      });

    } catch (error) {
      console.error('Failed to create invitation:', error);
      alert('Failed to create invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCanvas = currentStep === 5;
  const isPricing = currentStep === 6;

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
            {data.theme?.enableDesignMode && (
              <div className="absolute right-2 top-2 z-50 flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Design Mode
              </div>
            )}
            {content}
          </div>

          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <div className="h-1 w-32 rounded-full bg-black/30" />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-[14px] rounded-[44px]"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 50%)' }}
        />
      </div>
    </div>
  );

  const desktopFrame = (content) => (
    <div
      className="relative origin-top overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]"
      style={{ transform: `scale(${zoom / 100})` }}
    >
      {data.theme?.enableDesignMode && (
        <div className="absolute right-2 top-2 z-50 flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Design Mode
        </div>
      )}
      {content}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customize Your Invitation</h1>
          <p className="mt-0.5 text-sm text-slate-500">Build your wedding website step by step, then refine the real preview directly.</p>
        </div>
        <Button variant="outline" onClick={clearData} className="shrink-0 border-red-200 text-red-600 hover:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
      </div>

      {isCanvas ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-[24px] border border-slate-100 bg-white p-4">
            <Stepper steps={STEPS} currentStep={currentStep} onStepChange={setCurrentStep} progressInfo={calculateProgress()} />
          </div>

          <div
            className="grid overflow-hidden rounded-[28px] shadow-2xl xl:grid-cols-[360px_1fr]"
            style={{ height: 'calc(100vh - 180px)', minHeight: 880, background: '#0f1117', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="min-h-[560px] border-b border-white/8 xl:min-h-0 xl:border-b-0 xl:border-r xl:border-r-white/8">
              <DragDropCanvas />
            </div>

            <div className="flex flex-col justify-between p-8 text-white" style={{ background: '#13151c' }}>
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/45">
                  <Eye className="h-3.5 w-3.5 text-white/35" />
                  Live Preview Page
                </div>
                <h2 className="mt-6 text-4xl font-semibold tracking-tight">Open the preview in its own workspace.</h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/65">
                  The builder now keeps editing controls separate. Use the dedicated preview page for full-screen desktop and mobile review, theme switching, zooming, and live design-mode adjustments.
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid gap-3 text-sm text-white/60 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                    <div className="font-semibold text-white">Full page canvas</div>
                    <div className="mt-2 leading-6">Preview no longer competes with the builder layout.</div>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                    <div className="font-semibold text-white">Desktop and mobile</div>
                    <div className="mt-2 leading-6">Switch device frames on the preview page itself.</div>
                  </div>
                  <div className="rounded-[24px] border border-white/8 bg-white/5 p-4">
                    <div className="font-semibold text-white">Live theme review</div>
                    <div className="mt-2 leading-6">Test your current design without leaving the project state.</div>
                  </div>
                </div>

                <Link
                  to="/live-preview"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_20px_40px_rgba(255,255,255,0.12)] transition hover:bg-slate-100"
                >
                  Open Live Preview Page
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prev}><ChevronLeft className="h-4 w-4" /> Previous</Button>
            <Button variant="primary" onClick={next} disabled={currentStep === STEPS.length - 1}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[400px_1fr]">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-100 bg-white p-4">
              <Stepper steps={STEPS} currentStep={currentStep} onStepChange={setCurrentStep} progressInfo={calculateProgress()} />
            </div>

            <div className="min-h-[400px]">
              {currentStep === 0 && <CoupleInfo />}
              {currentStep === 1 && <EventDetails />}
              {currentStep === 2 && <FamilyContent />}
              {currentStep === 3 && <MediaUpload />}
              {currentStep === 4 && <ThemeSelector />}
              {isPricing && (
                <Card title="Publish Your Invitation" subtitle="Ready to share your beautiful invitation with the world!" icon={Crown}>
                  {publishedInvitation ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-6 text-green-800">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-semibold">Invitation Published Successfully!</h3>
                          <p className="text-sm text-green-700">Your wedding invitation is now live and shareable.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Shareable Link</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={publishedInvitation.shareUrl}
                              readOnly
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-50"
                            />
                            <Button
                              onClick={() => navigator.clipboard.writeText(publishedInvitation.shareUrl)}
                              variant="outline"
                              className="px-4"
                            >
                              Copy
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => window.open(publishedInvitation.shareUrl, '_blank')}
                            className="flex-1"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Invitation
                          </Button>
                          <Button
                            onClick={() => {
                              setPublishedInvitation(null);
                              clearData();
                              setCurrentStep(0);
                            }}
                            variant="outline"
                          >
                            Create Another
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-2xl bg-slate-50 p-6">
                        <h3 className="font-semibold text-slate-900 mb-2">Ready to Publish</h3>
                        <p className="text-sm text-slate-600">
                          Your invitation will be published and a unique shareable link will be generated.
                          Guests can view and RSVP through this link.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="rounded-lg bg-white p-4 border border-slate-200">
                            <div className="font-medium text-slate-900">Template</div>
                            <div className="text-slate-600">{data?.theme?.templateId || 'Classic'}</div>
                          </div>
                          <div className="rounded-lg bg-white p-4 border border-slate-200">
                            <div className="font-medium text-slate-900">Progress</div>
                            <div className="text-slate-600">{calculateProgress().percentage}% Complete</div>
                          </div>
                        </div>

                        <Button
                          onClick={handleSubmitInvitation}
                          disabled={isSubmitting || calculateProgress().percentage < 80}
                          className="w-full py-3 text-lg"
                        >
                          {isSubmitting ? 'Publishing...' : '🚀 Publish Invitation'}
                        </Button>

                        {calculateProgress().percentage < 80 && (
                          <p className="text-sm text-amber-600 text-center">
                            Please complete at least 80% of the form before publishing.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={prev} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button variant="primary" onClick={next} disabled={currentStep === STEPS.length - 1}>
                {currentStep === 4 ? <><Layers className="w-4 h-4" /> Canvas Designer</> : <>Next <ChevronRight className="h-4 w-4" /></>}
              </Button>
            </div>
          </div>

          <div className="sticky top-24 flex h-[calc(100vh-120px)] min-h-[700px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 shadow-2xl">
            <div className="z-20 flex shrink-0 items-center justify-between border-b bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md">
              <div className="flex rounded-xl bg-slate-200/60 p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn('flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all', previewMode === 'desktop' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700')}
                >
                  <Monitor className="h-4 w-4" /> <span className="hidden xl:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn('flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all', previewMode === 'mobile' ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-900/5' : 'text-slate-500 hover:text-slate-700')}
                >
                  <Smartphone className="h-4 w-4" /> <span className="hidden xl:inline">Mobile</span>
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-200/60 p-1 text-xs">
                <button onClick={() => setZoom((z) => Math.max(z - 10, 30))} className="rounded-lg p-1.5 transition-all hover:bg-white"><ZoomOut className="h-4 w-4" /></button>
                <span className="w-10 text-center font-bold text-slate-700">{zoom}%</span>
                <button onClick={() => setZoom((z) => Math.min(z + 10, 200))} className="rounded-lg p-1.5 transition-all hover:bg-white"><ZoomIn className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="relative flex flex-grow items-start justify-center overflow-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] p-8 [background-size:24px_24px]">
              {previewMode === 'mobile'
                ? iPhoneFrame(<TemplateRenderer type={data.theme?.id} data={data} />)
                : desktopFrame(<TemplateRenderer type={data.theme?.id} data={data} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
