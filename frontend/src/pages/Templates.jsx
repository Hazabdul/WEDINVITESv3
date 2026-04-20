import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { useInvitationState } from '../hooks/useInvitationState';
import { templatesList } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { TemplateRenderer } from '../components/preview/TemplateRenderer';

export function Templates() {
  const navigate = useNavigate();
  const { data, setTemplate } = useInvitationState();
  const featuredTemplate = templatesList.find((template) => template.id === 'ceremony') || templatesList[0];

  const previewData = {
    ...data,
    theme: {
      ...data.theme,
      id: featuredTemplate.id,
    },
  };

  const handleUseTemplate = () => {
    setTemplate(featuredTemplate.id);
    navigate('/builder');
  };

  return (
    <main className="bg-[linear-gradient(180deg,#fbf7f2_0%,#f6efe7_100%)]">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr] xl:items-start">
          <div className="space-y-6 rounded-[36px] border border-[#ece2d6] bg-white/82 p-6 shadow-[0_24px_80px_-42px_rgba(61,46,33,0.32)] backdrop-blur-md sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eadfd2] bg-[#faf5ef] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9b8876]">
              <Sparkles className="h-4 w-4 text-[#b08968]" />
              New featured template
            </div>

            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#2f2925] sm:text-5xl">
                {featuredTemplate.name}
              </h1>
              <p className="mt-4 text-base leading-8 text-[#6d6259]">
                A calmer ceremonial layout built from the structure of the reference invitation:
                centered names, family introductions, celebration details, gallery moments, and a quiet closing section.
              </p>
            </div>

            <div className="space-y-3 rounded-[28px] border border-[#efe4d8] bg-[#fcfaf7] p-5">
              {featuredTemplate.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-[#5f544d]">
                  <CheckCircle2 className="h-4 w-4 text-[#b08968]" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-[#eadfd2] bg-[linear-gradient(180deg,#fffdf9_0%,#f7f1ea_100%)] p-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9b8876]">
                <Heart className="h-4 w-4 text-[#b08968]" />
                Why this direction
              </div>
              <p className="mt-3 text-sm leading-7 text-[#6b6057]">
                It feels closer to a formal wedding invitation than a product card. The pacing is slower,
                the typography is softer, and the content is framed around the couple and their families.
              </p>
            </div>

            <Button
              onClick={handleUseTemplate}
              className="w-full justify-center rounded-[24px] bg-[#2f2925] px-6 py-4 text-sm font-semibold hover:bg-[#231e1a]"
            >
              Use This Template
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-[28px] border border-[#e9dfd4] bg-white/75 p-3 shadow-[0_30px_90px_-45px_rgba(61,46,33,0.36)] backdrop-blur-md sm:rounded-[36px] sm:p-5">
            <div className="mb-4 flex items-center gap-2 rounded-full border border-[#ede3d8] bg-[#faf6f0] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#9a8a7d]">
              Live preview
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#ece1d5] bg-[#f5eee6] shadow-[0_24px_60px_-34px_rgba(61,46,33,0.26)] sm:rounded-[30px]">
              <div className="flex items-center gap-2 border-b border-[#ede2d6] bg-white px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#d8baa0]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ead7bf]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#c9c7b8]" />
              </div>

              <div className="aspect-[4/5] overflow-hidden bg-white sm:aspect-[16/13]">
                <div className="origin-top-left w-[294.2%] scale-[0.34] sm:w-[217.4%] sm:scale-[0.46]">
                  <TemplateRenderer type={featuredTemplate.id} data={previewData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
