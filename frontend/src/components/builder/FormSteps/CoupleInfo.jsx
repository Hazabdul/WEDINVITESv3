import React from 'react';
import { useInvitationState } from '../../../hooks/useInvitationState';
import { Card } from '../../ui/Card';
import { Input, Textarea } from '../../ui/FormElements';
import { Heart } from 'lucide-react';

export function CoupleInfo() {
  const { data, updateSection } = useInvitationState();
  const { couple, content } = data;

  return (
    <Card title="Couple Details" subtitle="Set the names and introduction." icon={Heart}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Bride Name" placeholder="e.g. Emma" value={couple.bride} onChange={(e) => updateSection('couple', 'bride', e.target.value)} />
        <Input label="Groom Name" placeholder="e.g. Liam" value={couple.groom} onChange={(e) => updateSection('couple', 'groom', e.target.value)} />
        <Input label="Tagline" placeholder="e.g. Are tying the knot!" value={couple.title} onChange={(e) => updateSection('couple', 'title', e.target.value)} />
        <Input label="Welcome Heading" placeholder="e.g. Welcome to our beginning" value={content.welcomeHeading} onChange={(e) => updateSection('content', 'welcomeHeading', e.target.value)} />
      </div>
      <div className="mt-4">
        <Textarea label="Intro Message" placeholder="Share a brief sweet message or quote about your journey together..." value={content.introMessage} onChange={(e) => updateSection('content', 'introMessage', e.target.value)} />
      </div>
    </Card>
  );
}
