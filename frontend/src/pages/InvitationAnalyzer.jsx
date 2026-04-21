import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import {
  Download,
  ImagePlus,
  LayoutTemplate,
  LoaderCircle,
  Palette,
  Sparkles,
  Type,
  WandSparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/FormElements';
import apiClient from '../utils/api';
import { cn } from '../utils/cn';

const EMPTY_ANALYSIS = {
  card_type: '',
  bride_name: '',
  groom_name: '',
  event_type: '',
  date: '',
  time: '',
  venue: '',
  address: '',
  rsvp_phone: '',
  notes: '',
  visual_style: {
    theme: '',
    primary_colors: [],
    layout: '',
    font_style: '',
    design_elements: [],
  },
};

const DETAIL_FIELDS = [
  { key: 'bride_name', label: 'Bride Name', placeholder: 'Enter bride name' },
  { key: 'groom_name', label: 'Groom Name', placeholder: 'Enter groom name' },
  { key: 'event_type', label: 'Event Type', placeholder: 'Wedding Reception' },
  { key: 'date', label: 'Date', placeholder: 'Saturday, 18 October 2026' },
  { key: 'time', label: 'Time', placeholder: '6:30 PM' },
  { key: 'venue', label: 'Venue', placeholder: 'The Grand Pavilion' },
  { key: 'address', label: 'Address', placeholder: '123 Celebration Avenue, Riyadh' },
  { key: 'rsvp_phone', label: 'RSVP Phone', placeholder: '+966 555 123 456' },
];

const FONT_STYLE_CLASS = {
  script: 'font-serif italic tracking-[0.08em]',
  serif: 'font-serif tracking-[0.04em]',
  modern: 'font-sans uppercase tracking-[0.18em]',
  minimal: 'font-sans uppercase tracking-[0.22em]',
};

function normalizeAnalysis(payload = {}) {
  return {
    ...EMPTY_ANALYSIS,
    ...payload,
    visual_style: {
      ...EMPTY_ANALYSIS.visual_style,
      ...(payload.visual_style || {}),
      primary_colors: Array.isArray(payload.visual_style?.primary_colors) ? payload.visual_style.primary_colors : [],
      design_elements: Array.isArray(payload.visual_style?.design_elements) ? payload.visual_style.design_elements : [],
    },
  };
}

function ColorSwatch({ color }) {
  return (
    <div className="space-y-2">
      <div className="h-12 rounded-2xl border border-black/5 shadow-inner" style={{ backgroundColor: color }} />
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{color}</div>
    </div>
  );
}

function TemplateOption({ src, isSelected, onSelect, index }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group overflow-hidden rounded-[28px] border bg-white text-left transition-all',
        isSelected
          ? 'border-[#2f2925] shadow-[0_26px_60px_-26px_rgba(47,41,37,0.45)]'
          : 'border-[#eadfd2] hover:-translate-y-1 hover:border-[#ccb49a] hover:shadow-[0_20px_45px_-30px_rgba(47,41,37,0.35)]'
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f7f1ea]">
        <img src={src} alt={`Generated invitation template ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2f2925]">Template {index + 1}</div>
          <div className="mt-1 text-xs text-slate-500">{isSelected ? 'Selected for editing' : 'Click to preview'}</div>
        </div>
        <div className={cn('h-3 w-3 rounded-full border', isSelected ? 'border-[#2f2925] bg-[#2f2925]' : 'border-slate-300 bg-white')} />
      </div>
    </button>
  );
}

function EditableOverlayField({ label, value, onChange, className, multiline = false }) {
  const sharedClasses =
    'w-full rounded-2xl border border-white/65 bg-white/72 px-3 py-2 text-center text-sm font-medium text-[#2f2925] shadow-[0_14px_30px_-22px_rgba(47,41,37,0.35)] backdrop-blur-md outline-none transition focus:border-[#b8926d]';

  return (
    <label className={cn('absolute', className)}>
      <span className="sr-only">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={onChange} rows={2} className={cn(sharedClasses, 'resize-none')} />
      ) : (
        <input value={value} onChange={onChange} className={sharedClasses} />
      )}
    </label>
  );
}

export function InvitationAnalyzer() {
  const previewCanvasRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const [analysis, setAnalysis] = useState(EMPTY_ANALYSIS);
  const [details, setDetails] = useState(EMPTY_ANALYSIS);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '' });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (templates.length === 0) {
      setSelectedTemplate('');
      return;
    }

    if (!templates.includes(selectedTemplate)) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates, selectedTemplate]);

  const styleSummary = useMemo(() => normalizeAnalysis(analysis).visual_style, [analysis]);
  const previewFontClass = useMemo(() => {
    const value = (styleSummary.font_style || '').toLowerCase();
    if (value.includes('script')) return FONT_STYLE_CLASS.script;
    if (value.includes('modern')) return FONT_STYLE_CLASS.modern;
    if (value.includes('minimal')) return FONT_STYLE_CLASS.minimal;
    return FONT_STYLE_CLASS.serif;
  }, [styleSummary.font_style]);

  const updateDetailField = (key, value) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setError('');
    setAnalysis(EMPTY_ANALYSIS);
    setDetails(EMPTY_ANALYSIS);
    setTemplates([]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Select an invitation image before analyzing.');
      return;
    }

    setError('');
    setStatus({ loading: true, message: 'Reading the invitation, extracting text, and identifying the design language.' });

    try {
      const response = normalizeAnalysis(await apiClient.analyzeInvitation(selectedFile));
      setAnalysis(response);
      setDetails(response);
      setTemplates([]);
    } catch (requestError) {
      setError(requestError.message || 'Invitation analysis failed.');
    } finally {
      setStatus({ loading: false, message: '' });
    }
  };

  const handleGenerateTemplates = async () => {
    setError('');
    setStatus({ loading: true, message: 'Generating editable invitation concepts from the extracted style profile.' });

    try {
      const response = await apiClient.generateInvitationTemplates({
        ...details,
        card_type: analysis.card_type,
        visual_style: analysis.visual_style,
      });

      setTemplates(Array.isArray(response.templates) ? response.templates.slice(0, 3) : []);
    } catch (requestError) {
      setError(requestError.message || 'Template generation failed.');
    } finally {
      setStatus({ loading: false, message: '' });
    }
  };

  const exportPreview = async (format) => {
    if (!previewCanvasRef.current) return;

    setIsExporting(true);
    setError('');

    try {
      const dataUrl = await toPng(previewCanvasRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      if (format === 'image') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'invitation-preview.png';
        link.click();
        return;
      }

      const bounds = previewCanvasRef.current.getBoundingClientRect();
      const orientation = bounds.width > bounds.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [bounds.width, bounds.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, bounds.width, bounds.height);
      pdf.save('invitation-preview.pdf');
    } catch (exportError) {
      setError(exportError.message || 'Preview export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf4_0%,#f8f1e8_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[36px] border border-[#eadfd2] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(47,41,37,0.42)] backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="space-y-6">
              <div>
                <div className="inline-flex rounded-full border border-[#e6d6c4] bg-[#fff8f1] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#9a7757]">
                  Invitation Analyzer & Generator
                </div>
                <h1 className="mt-5 text-4xl leading-tight text-[#2f2925] sm:text-5xl">
                  Turn any invite into an editable design workflow.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-[#6d6257]">
                  Upload an invitation image, extract the event details and design language, then generate matching templates you can edit and export.
                </p>
              </div>

              <Card
                icon={ImagePlus}
                title="1. Upload Invitation"
                subtitle="Use JPG, PNG, or WebP. The uploaded card is previewed before analysis."
                className="border-[#eee1d3] bg-[#fffcf8]"
              >
                <div className="space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8c2aa] bg-[#fff7ee] px-5 py-8 text-center transition hover:border-[#b8926d] hover:bg-[#fff4e7]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <ImagePlus className="h-8 w-8 text-[#9a7757]" />
                    <span className="mt-3 text-sm font-semibold text-[#2f2925]">Choose invitation image</span>
                    <span className="mt-1 text-xs uppercase tracking-[0.22em] text-[#9a7757]">Image upload section</span>
                  </label>

                  <div className="overflow-hidden rounded-[28px] border border-[#efe2d4] bg-[#f8f1e8]">
                    <div className="aspect-[4/5]">
                      {selectedFilePreview ? (
                        <img src={selectedFilePreview} alt="Uploaded invitation preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8b7a68]">
                          Uploaded invitation preview will appear here.
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleAnalyze} disabled={!selectedFile || status.loading} className="w-full bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)] hover:bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)]">
                    <Sparkles className="h-4 w-4" />
                    Analyze Invitation
                  </Button>
                </div>
              </Card>

              <Card
                icon={status.loading ? LoaderCircle : WandSparkles}
                title="2. Processing Status"
                subtitle="The page shows a loader while the invitation is being processed."
                className="border-[#eee1d3] bg-white"
              >
                {status.loading ? (
                  <div className="flex items-start gap-4 rounded-[24px] border border-[#ecdcc9] bg-[#fff8f1] p-4">
                    <LoaderCircle className="mt-1 h-5 w-5 animate-spin text-[#9a7757]" />
                    <div>
                      <div className="text-sm font-semibold text-[#2f2925]">Processing invitation</div>
                      <p className="mt-1 text-sm leading-6 text-[#6d6257]">{status.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#e8d9c8] bg-[#fffdfa] p-4 text-sm text-[#6d6257]">
                    Upload an invite, analyze it, then generate matching templates from the extracted style profile.
                  </div>
                )}

                {error ? (
                  <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
              </Card>

              <Card
                icon={Palette}
                title="4. Style Analysis"
                subtitle="Auto-detected design traits are summarized here."
                className="border-[#eee1d3] bg-white"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Card Type</div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{analysis.card_type || 'Not analyzed yet'}</div>
                  </div>
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Theme</div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{styleSummary.theme || 'Waiting for analysis'}</div>
                  </div>
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">
                      <LayoutTemplate className="h-4 w-4" />
                      Layout
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{styleSummary.layout || 'Waiting for analysis'}</div>
                  </div>
                  <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">
                      <Type className="h-4 w-4" />
                      Font Style
                    </div>
                    <div className="mt-2 text-base font-semibold text-[#2f2925]">{styleSummary.font_style || 'Waiting for analysis'}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Colors</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(styleSummary.primary_colors.length > 0 ? styleSummary.primary_colors : ['#F5EDE2', '#C89C6D', '#3B2C25']).map((color) => (
                      <ColorSwatch key={color} color={color} />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Design Elements</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(styleSummary.design_elements.length > 0 ? styleSummary.design_elements : ['border', 'ornament', 'floral']).map((element) => (
                      <span key={element} className="rounded-full border border-[#e6d6c4] bg-[#fff8f1] px-3 py-1.5 text-xs font-medium text-[#6d6257]">
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card
                title="3. Extracted Details"
                subtitle="The form is auto-filled from the analysis response, but every field remains editable."
                className="border-[#eee1d3] bg-white"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {DETAIL_FIELDS.map((field) => (
                    <Input
                      key={field.key}
                      label={field.label}
                      value={details[field.key] || ''}
                      onChange={(event) => updateDetailField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  ))}
                  <Textarea
                    label="Notes"
                    value={details.notes || ''}
                    onChange={(event) => updateDetailField('notes', event.target.value)}
                    placeholder="Add extra notes or corrections"
                    rows={4}
                    className="md:col-span-2"
                  />
                </div>
              </Card>

              <Card
                title="5. Generate Similar Template"
                subtitle="Use the extracted style data to create 2-3 invitation directions, then select one."
                className="border-[#eee1d3] bg-white"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-[#6d6257]">
                      Theme: <span className="font-semibold text-[#2f2925]">{styleSummary.theme || 'Not available yet'}</span>
                    </div>
                    <Button onClick={handleGenerateTemplates} disabled={status.loading} className="bg-[linear-gradient(135deg,#b8926d_0%,#8f6949_100%)] hover:bg-[linear-gradient(135deg,#b8926d_0%,#8f6949_100%)]">
                      <WandSparkles className="h-4 w-4" />
                      Generate Similar Template
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {templates.length > 0 ? (
                      templates.map((template, index) => (
                        <TemplateOption
                          key={`${template.slice(0, 48)}-${index}`}
                          src={template}
                          index={index}
                          isSelected={selectedTemplate === template}
                          onSelect={() => setSelectedTemplate(template)}
                        />
                      ))
                    ) : (
                      <div className="md:col-span-3 rounded-[28px] border border-dashed border-[#e8d9c8] bg-[#fffdfa] px-6 py-10 text-center text-sm text-[#6d6257]">
                        Generate templates after analysis to preview options here.
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card
                title="6. Editable Preview"
                subtitle="Select a template, then edit the overlaid fields directly on top of the design."
                className="border-[#eee1d3] bg-white"
              >
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="overflow-hidden rounded-[32px] border border-[#eadfd2] bg-[#f5ece2] p-3">
                    <div
                      ref={previewCanvasRef}
                      className="relative mx-auto aspect-[3/4] w-full max-w-[540px] overflow-hidden rounded-[28px] bg-[#f3e9dd]"
                    >
                      {selectedTemplate ? (
                        <img src={selectedTemplate} alt="Selected invitation template" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm text-[#8b7a68]">
                          Select a generated template to start editing the preview.
                        </div>
                      )}

                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.06)_100%)]" />

                      <div className={cn('absolute inset-0', previewFontClass)}>
                        <EditableOverlayField
                          label="Bride Name"
                          value={details.bride_name || ''}
                          onChange={(event) => updateDetailField('bride_name', event.target.value)}
                          className="left-[14%] top-[14%] w-[72%]"
                        />
                        <EditableOverlayField
                          label="Groom Name"
                          value={details.groom_name || ''}
                          onChange={(event) => updateDetailField('groom_name', event.target.value)}
                          className="left-[14%] top-[24%] w-[72%]"
                        />
                        <EditableOverlayField
                          label="Event Type"
                          value={details.event_type || ''}
                          onChange={(event) => updateDetailField('event_type', event.target.value)}
                          className="left-[18%] top-[37%] w-[64%]"
                        />
                        <EditableOverlayField
                          label="Date"
                          value={details.date || ''}
                          onChange={(event) => updateDetailField('date', event.target.value)}
                          className="left-[10%] top-[53%] w-[36%]"
                        />
                        <EditableOverlayField
                          label="Time"
                          value={details.time || ''}
                          onChange={(event) => updateDetailField('time', event.target.value)}
                          className="right-[10%] top-[53%] w-[28%]"
                        />
                        <EditableOverlayField
                          label="Venue"
                          value={details.venue || ''}
                          onChange={(event) => updateDetailField('venue', event.target.value)}
                          className="left-[12%] top-[66%] w-[76%]"
                        />
                        <EditableOverlayField
                          label="Address"
                          value={details.address || ''}
                          onChange={(event) => updateDetailField('address', event.target.value)}
                          className="left-[12%] top-[75%] w-[76%]"
                        />
                        <EditableOverlayField
                          label="RSVP Phone"
                          value={details.rsvp_phone || ''}
                          onChange={(event) => updateDetailField('rsvp_phone', event.target.value)}
                          className="left-[12%] top-[85%] w-[34%]"
                        />
                        <EditableOverlayField
                          label="Notes"
                          value={details.notes || ''}
                          onChange={(event) => updateDetailField('notes', event.target.value)}
                          className="right-[12%] top-[83%] w-[38%]"
                          multiline
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[28px] border border-[#eadfd2] bg-[#fffcf8] p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Preview Binding</div>
                      <p className="mt-3 text-sm leading-6 text-[#6d6257]">
                        The overlay fields are live. Changes in the form and preview stay synchronized so the export reflects the current copy.
                      </p>
                    </div>

                    <div className="rounded-[28px] border border-[#eadfd2] bg-[#fffcf8] p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Current Style</div>
                      <div className="mt-3 space-y-3 text-sm text-[#6d6257]">
                        <div><span className="font-semibold text-[#2f2925]">Theme:</span> {styleSummary.theme || 'N/A'}</div>
                        <div><span className="font-semibold text-[#2f2925]">Layout:</span> {styleSummary.layout || 'N/A'}</div>
                        <div><span className="font-semibold text-[#2f2925]">Font:</span> {styleSummary.font_style || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#eadfd2] bg-[#fffcf8] p-5">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">7. Export Option</div>
                      <div className="mt-4 grid gap-3">
                        <Button onClick={() => exportPreview('image')} disabled={!selectedTemplate || isExporting} className="w-full bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)] hover:bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)]">
                          {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Download as Image
                        </Button>
                        <Button onClick={() => exportPreview('pdf')} disabled={!selectedTemplate || isExporting} variant="outline" className="w-full border-[#ccb49a] text-[#5f4c3d] hover:bg-[#fff5ea]">
                          {isExporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Download as PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default InvitationAnalyzer;
