import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, LayoutTemplate, LoaderCircle, Palette, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/FormElements';
import GeneratedWebsiteRenderer from '../components/website/GeneratedWebsiteRenderer';
import apiClient from '../utils/api';

function ColorSwatch({ color }) {
  return (
    <div className="space-y-2">
      <div className="h-12 rounded-2xl border border-black/5 shadow-inner" style={{ backgroundColor: color }} />
      <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{color}</div>
    </div>
  );
}

function SectionSummary({ section }) {
  return (
    <div className="rounded-[22px] border border-[#eadfd2] bg-white/70 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a7757]">{section.type.replace('_', ' ')}</div>
      <div className="mt-2 text-base font-semibold text-[#2f2925]">{section.title}</div>
      {'description' in section && section.description ? (
        <p className="mt-2 text-sm leading-6 text-[#6d6257]">{section.description}</p>
      ) : null}
    </div>
  );
}

export function ImageToWebsite() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '' });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview('');
      return undefined;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreview(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [selectedFile]);

  const palette = useMemo(() => result?.analysis?.palette || [], [result]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setError('');
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Select a reference image before generating a webpage.');
      return;
    }

    setError('');
    setStatus({
      loading: true,
      message: 'Analyzing the visual structure, extracting a reusable layout, and generating a responsive page spec.',
    });

    try {
      const payload = await apiClient.generateWebsiteFromImage(selectedFile, instructions);
      setResult(payload);
    } catch (requestError) {
      setError(requestError.message || 'Image-to-website generation failed.');
    } finally {
      setStatus({ loading: false, message: '' });
    }
  };

  return (
    <div className="bg-[linear-gradient(180deg,#fffaf4_0%,#f8f1e8_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[36px] border border-[#eadfd2] bg-white/78 p-7 shadow-[0_30px_90px_-50px_rgba(47,41,37,0.42)] backdrop-blur-xl sm:p-10">
          <div className="grid gap-10 xl:grid-cols-[400px_minmax(0,1fr)]">
            <div className="space-y-6">
              <div>
                <div className="inline-flex rounded-full border border-[#e6d6c4] bg-[#fff8f1] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#9a7757]">
                  Image To Website
                </div>
                <h1 className="mt-5 text-4xl leading-tight text-[#2f2925] sm:text-5xl">
                  Convert a UI image into a reusable page inside your app.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-[#6d6257]">
                  Upload a screenshot or reference layout, then generate a responsive webpage plan rendered with the same Tailwind and component language already used in this project.
                </p>
              </div>

              <Card
                icon={ImagePlus}
                title="1. Upload Reference"
                subtitle="Use a UI screenshot, landing page mockup, hero section, or full-page design reference."
                className="border-[#eee1d3] bg-[#fffcf8]"
              >
                <div className="space-y-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d8c2aa] bg-[#fff7ee] px-5 py-8 text-center transition hover:border-[#b8926d] hover:bg-[#fff4e7]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <ImagePlus className="h-8 w-8 text-[#9a7757]" />
                    <span className="mt-3 text-sm font-semibold text-[#2f2925]">Choose reference image</span>
                    <span className="mt-1 text-xs uppercase tracking-[0.22em] text-[#9a7757]">PNG, JPG, WebP</span>
                  </label>

                  <div className="overflow-hidden rounded-[28px] border border-[#efe2d4] bg-[#f8f1e8]">
                    <div className="aspect-[4/5]">
                      {selectedFilePreview ? (
                        <img src={selectedFilePreview} alt="Uploaded reference preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[#8b7a68]">
                          The uploaded reference preview will appear here.
                        </div>
                      )}
                    </div>
                  </div>

                  <Textarea
                    label="Optional Instructions"
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    rows={4}
                    placeholder="Example: keep the hero minimal, use warmer colors, and make the CTA section stronger on mobile."
                  />

                  <Button onClick={handleGenerate} disabled={!selectedFile || status.loading} className="w-full bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)] hover:bg-[linear-gradient(135deg,#2f2925_0%,#5a4636_100%)]">
                    {status.loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate Webpage
                  </Button>
                </div>
              </Card>

              <Card
                icon={status.loading ? LoaderCircle : LayoutTemplate}
                title="2. Generation Status"
                subtitle="The backend follows a screenshot-to-structure pipeline and returns a strict page spec."
                className="border-[#eee1d3] bg-white"
              >
                {status.loading ? (
                  <div className="flex items-start gap-4 rounded-[24px] border border-[#ecdcc9] bg-[#fff8f1] p-4">
                    <LoaderCircle className="mt-1 h-5 w-5 animate-spin text-[#9a7757]" />
                    <div>
                      <div className="text-sm font-semibold text-[#2f2925]">Generating webpage</div>
                      <p className="mt-1 text-sm leading-6 text-[#6d6257]">{status.message}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#e8d9c8] bg-[#fffdfa] p-4 text-sm text-[#6d6257]">
                    Upload an image, then generate a page spec that preserves hierarchy, palette, and structure while staying within your component system.
                  </div>
                )}

                {error ? (
                  <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}
              </Card>

              {result ? (
                <Card
                  icon={Palette}
                  title="3. Design Analysis"
                  subtitle="The model’s structural read of the uploaded UI."
                  className="border-[#eee1d3] bg-white"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Page Title</div>
                      <div className="mt-2 text-base font-semibold text-[#2f2925]">{result.analysis.page_title}</div>
                    </div>
                    <div className="rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Layout Style</div>
                      <div className="mt-2 text-base font-semibold text-[#2f2925]">{result.analysis.layout_style}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[24px] border border-[#efe2d4] bg-[#fffcf8] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Summary</div>
                    <p className="mt-2 text-sm leading-7 text-[#6d6257]">{result.analysis.summary}</p>
                  </div>

                  <div className="mt-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Palette</div>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {palette.map((color) => (
                        <ColorSwatch key={color} color={color} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7757]">Observed Elements</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {result.analysis.observed_elements.map((element) => (
                        <span key={element} className="rounded-full border border-[#e6d6c4] bg-[#fff8f1] px-3 py-1.5 text-xs font-medium text-[#6d6257]">
                          {element}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card
                title="4. Generated Webpage"
                subtitle="This preview is rendered by local React components, not remote HTML execution."
                className="border-[#eee1d3] bg-white"
              >
                {result ? (
                  <GeneratedWebsiteRenderer spec={result} />
                ) : (
                  <div className="rounded-[28px] border border-dashed border-[#e8d9c8] bg-[#fffdfa] px-6 py-12 text-center text-sm text-[#6d6257]">
                    Generate a webpage to preview it here.
                  </div>
                )}
              </Card>

              {result ? (
                <Card
                  title="5. Page Structure"
                  subtitle="The generated sections mapped into your app’s renderable layout blocks."
                  className="border-[#eee1d3] bg-white"
                >
                  <div className="space-y-4">
                    {result.page.sections.map((section) => (
                      <SectionSummary key={`${section.type}-${section.title}`} section={section} />
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ImageToWebsite;
