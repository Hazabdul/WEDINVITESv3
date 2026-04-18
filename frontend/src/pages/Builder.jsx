import React, { useMemo, useState } from 'react';
import { useInvitationState } from '../hooks/useInvitationState';
import { Stepper } from '../components/builder/Stepper';
import { CoupleInfo } from '../components/builder/FormSteps/CoupleInfo';
import { EventDetails } from '../components/builder/FormSteps/EventDetails';
import { FamilyContent } from '../components/builder/FormSteps/FamilyContent';
import { MediaUpload } from '../components/builder/FormSteps/MediaUpload';
import { ThemeSelector } from '../components/builder/FormSteps/ThemeSelector';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';
import { Button } from '../components/ui/Button';
import apiClient from '../utils/api';
import {
  ChevronLeft, ChevronRight, Crown, Trash2,
  Monitor, Smartphone, ZoomIn, ZoomOut, CheckCircle, ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';
import { templatesList } from '../data/mockData';

const STEPS = [
  'Couple Info',
  'Event Details',
  'Family + Content',
  'Media',
  'Theme',
  'Pricing',
];

export function Builder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [zoom, setZoom] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedInvitation, setPublishedInvitation] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);
  const { data, clearData } = useInvitationState();

  const next = () => setCurrentStep((p) => Math.min(p + 1, STEPS.length - 1));
  const prev = () => setCurrentStep((p) => Math.max(p - 1, 0));

  const progressInfo = useMemo(() => {
    const requiredFields = [
      { label: 'Bride name', value: data?.couple?.bride },
      { label: 'Groom name', value: data?.couple?.groom },
      { label: 'Invitation title', value: data?.couple?.title },
      { label: 'Wedding date', value: data?.event?.date },
      { label: 'Wedding time', value: data?.event?.time },
      { label: 'Venue', value: data?.event?.venue },
      { label: 'Bride family', value: data?.family?.brideParents },
      { label: 'Groom family', value: data?.family?.groomParents },
      { label: 'RSVP message', value: data?.content?.rsvpText },
    ];
    const filled = requiredFields.filter((field) => field.value && String(field.value).trim() !== '').length;
    return {
      percentage: Math.round((filled / requiredFields.length) * 100),
      missingFields: requiredFields.filter((field) => !field.value || String(field.value).trim() === '').map((field) => field.label),
    };
  }, [data]);

  const activeTemplateName = useMemo(
    () => templatesList.find((tpl) => tpl.id === data?.theme?.id)?.name || 'Classic Elegant',
    [data?.theme?.id]
  );

  const handleSubmitInvitation = async () => {
    if (!data || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const created = await apiClient.createInvitation({});

      const invitationData = {
        brideName: data.couple?.bride || '',
        groomName: data.couple?.groom || '',
        weddingDate: data.event?.date ? new Date(data.event.date) : null,
        couple: data.couple || {},
        event: data.event || {},
        family: data.family || {},
        content: data.content || {},
        theme: data.theme || { id: 'classic' },
        media: data.media || { gallery: [] },
        positions: data.positions || {},
      };

      await apiClient.updateInvitation(created._id, invitationData);
      const published = await apiClient.publishInvitation(created._id);

      setPublishedInvitation({
        id: created._id,
        slug: published.slug,
        shareUrl: `${window.location.origin}/invitation/${published.slug}`,
      });
    } catch (error) {
      console.error('Failed to create invitation:', error);
      setSubmitError('Publishing failed. Check the backend connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publishedInvitation?.shareUrl) return;
    await navigator.clipboard.writeText(publishedInvitation.shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const isPricing = currentStep === 5;

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
      {content}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customize Your Invitation</h1>
          <p className="mt-0.5 text-sm text-slate-500">Move step by step, preview live on the right, then publish when everything looks ready.</p>
        </div>
        <Button variant="outline" onClick={clearData} className="shrink-0 border-red-200 text-red-600 hover:bg-red-50">
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[400px_1fr]">
        <div className="space-y-5">
          <div className="rounded-[24px] border border-slate-100 bg-white p-4">
            <Stepper steps={STEPS} currentStep={currentStep} onStepChange={setCurrentStep} progressInfo={progressInfo} />
          </div>

          <div className="min-h-[400px]">
            {currentStep === 0 && <CoupleInfo />}
            {currentStep === 1 && <EventDetails />}
            {currentStep === 2 && <FamilyContent />}
            {currentStep === 3 && <MediaUpload />}
            {currentStep === 4 && <ThemeSelector />}
            {isPricing && (
              <Card title="Publish Your Invitation" subtitle="Generate a live link once the core details are complete." icon={Crown}>
                {publishedInvitation ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 rounded-2xl bg-green-50 p-6 text-green-800">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold">Invitation published</h3>
                        <p className="text-sm text-green-700">Your invitation is live and ready to share.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Shareable link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={publishedInvitation.shareUrl}
                            readOnly
                            className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                          />
                          <Button onClick={handleCopyLink} variant="outline" className="px-4">
                            {copied ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={() => window.open(publishedInvitation.shareUrl, '_blank')} className="flex-1">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Invitation
                        </Button>
                        <Button
                          onClick={() => {
                            setPublishedInvitation(null);
                            setSubmitError('');
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
                      <h3 className="mb-2 font-semibold text-slate-900">Ready to publish</h3>
                      <p className="text-sm text-slate-600">
                        We will create a live invitation page and generate a unique shareable link for your guests.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="font-medium text-slate-900">Template</div>
                        <div className="text-slate-600">{activeTemplateName}</div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <div className="font-medium text-slate-900">Progress</div>
                        <div className="text-slate-600">{progressInfo.percentage}% complete</div>
                      </div>
                    </div>

                    {submitError && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                      </div>
                    )}

                    <Button
                      onClick={handleSubmitInvitation}
                      disabled={isSubmitting || progressInfo.percentage < 80}
                      className="w-full py-3 text-lg"
                    >
                      {isSubmitting ? 'Publishing...' : 'Publish Invitation'}
                    </Button>

                    {progressInfo.percentage < 80 && (
                      <p className="text-center text-sm text-amber-600">
                        Complete at least 80% of the required details before publishing.
                      </p>
                    )}
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
              {currentStep === STEPS.length - 2 ? 'Review & Publish' : <>Next <ChevronRight className="h-4 w-4" /></>}
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
    </div>
  );
}
