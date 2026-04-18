import React from 'react';
import { useInvitationState } from '../../../hooks/useInvitationState';
import { Card } from '../../ui/Card';
import { Input, Textarea } from '../../ui/FormElements';
import { Star } from 'lucide-react';

export function FamilyContent() {
  const { data, updateSection } = useInvitationState();
  const { family, content } = data;

  return (
    <Card title="Family & Content" subtitle="Customize the invitation details, family names, and messages." icon={Star}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Bride's Parents" placeholder="e.g. Mr. & Mrs. Smith" value={family.brideParents} onChange={(e) => updateSection('family', 'brideParents', e.target.value)} />
        <Input label="Groom's Parents" placeholder="e.g. Mr. & Mrs. Johnson" value={family.groomParents} onChange={(e) => updateSection('family', 'groomParents', e.target.value)} />
        <Input label="Contact Number 1" placeholder="e.g. +1 234 567 890" value={content.contact1} onChange={(e) => updateSection('content', 'contact1', e.target.value)} />
        <Input label="Contact Number 2" placeholder="e.g. +1 098 765 432" value={content.contact2} onChange={(e) => updateSection('content', 'contact2', e.target.value)} />
        <Input label="Dress Code" placeholder="e.g. Formal / Black Tie" value={content.dressCode} onChange={(e) => updateSection('content', 'dressCode', e.target.value)} />
        <Input label="RSVP Text" placeholder="e.g. Please respond by July 1st" value={content.rsvpText} onChange={(e) => updateSection('content', 'rsvpText', e.target.value)} />
      </div>
      <div className="mt-4 grid gap-4">
        <Textarea label="Family Message" placeholder="e.g. With the blessings of our beloved family..." value={content.familyMessage} onChange={(e) => updateSection('content', 'familyMessage', e.target.value)} />
        <Textarea label="Invitation Text" placeholder="e.g. We invite you to join us..." value={content.invitationText} onChange={(e) => updateSection('content', 'invitationText', e.target.value)} />
        <Textarea label="Quote / Blessing" placeholder="e.g. Two souls but a single thought..." value={content.quote} onChange={(e) => updateSection('content', 'quote', e.target.value)} />
        <Textarea label="Special Notes" placeholder="e.g. No boxed gifts please." value={content.specialNotes} onChange={(e) => updateSection('content', 'specialNotes', e.target.value)} rows={2} />
      </div>
    </Card>
  );
}
