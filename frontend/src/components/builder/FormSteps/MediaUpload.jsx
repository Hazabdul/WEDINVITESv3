import React from 'react';
import { useInvitationState } from '../../../hooks/useInvitationState';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/FormElements';
import { Upload, Image as ImageIcon, Video, Music } from 'lucide-react';

export function MediaUpload() {
  const { data, updateSection } = useInvitationState();
  const { media } = data;

  return (
    <Card title="Media Uploads" subtitle="Frontend-ready upload areas with URL placeholders." icon={Upload}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Cover Image URL" value={media.coverImage} onChange={(e) => updateSection('media', 'coverImage', e.target.value)} />
        <Input label="Background Image URL" value={media.backgroundImage} onChange={(e) => updateSection('media', 'backgroundImage', e.target.value)} />
        <Input label="Bride Image URL" value={media.brideImage} onChange={(e) => updateSection('media', 'brideImage', e.target.value)} />
        <Input label="Groom Image URL" value={media.groomImage} onChange={(e) => updateSection('media', 'groomImage', e.target.value)} />
        <Input label="Couple Image URL" value={media.coupleImage} onChange={(e) => updateSection('media', 'coupleImage', e.target.value)} />
        <Input label="Video URL" value={media.video} onChange={(e) => updateSection('media', 'video', e.target.value)} />
        <Input label="Music URL" value={media.music} onChange={(e) => updateSection('media', 'music', e.target.value)} />
      </div>
      {/* Visual Placeholder for drag and drop */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[{ icon: ImageIcon, title: "Image Upload", text: "Drag & drop file" },
          { icon: Video, title: "Video Upload", text: "Drag & drop video" },
          { icon: Music, title: "Audio Upload", text: "Drag & drop audio" }].map((item) => (
          <div key={item.title} className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition">
            <item.icon className="h-8 w-8 text-slate-400 mb-2" />
            <div className="font-medium text-slate-700">{item.title}</div>
            <div className="text-xs text-slate-500">{item.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
