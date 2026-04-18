import React from 'react';
import { useInvitationState } from '../../../hooks/useInvitationState';
import { Card } from '../../ui/Card';
import { Input, Textarea } from '../../ui/FormElements';
import { Button } from '../../ui/Button';
import { Calendar } from 'lucide-react';

export function EventDetails() {
  const { data, updateSection, updateEvent, addEvent } = useInvitationState();
  const { event, events } = data;

  return (
    <Card title="Event Details" subtitle="Configure the main event and add more occasions." icon={Calendar}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Main Wedding Date" type="date" placeholder="e.g. 2026-08-15" value={event.date} onChange={(e) => updateSection('event', 'date', e.target.value)} />
        <Input label="Main Wedding Time" placeholder="e.g. 4:00 PM" value={event.time} onChange={(e) => updateSection('event', 'time', e.target.value)} />
        <Input label="Venue Name" placeholder="e.g. The Grand Plaza" value={event.venue} onChange={(e) => updateSection('event', 'venue', e.target.value)} />
        <Input label="Google Maps Link" placeholder="e.g. https://maps.google.com/..." value={event.mapLink} onChange={(e) => updateSection('event', 'mapLink', e.target.value)} />
      </div>
      <div className="mt-4">
        <Textarea label="Venue Address" placeholder="e.g. 123 Wedding Blvd, City, Country" value={event.address} onChange={(e) => updateSection('event', 'address', e.target.value)} rows={2} />
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h4 className="font-semibold text-slate-900">Additional Events</h4>
          <Button onClick={addEvent} variant="primary" className="py-2 px-4 text-xs rounded-xl">Add Event</Button>
        </div>
        {events && events.map((evt) => (
          <div key={evt.id || evt.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 relative">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Event Name" placeholder="e.g. Haldi Ceremony" value={evt.name} onChange={(e) => updateEvent(evt.id, "name", e.target.value)} />
              <Input label="Date" type="date" placeholder="e.g. 2026-08-14" value={evt.date} onChange={(e) => updateEvent(evt.id, "date", e.target.value)} />
              <Input label="Time" placeholder="e.g. 10:00 AM" value={evt.time} onChange={(e) => updateEvent(evt.id, "time", e.target.value)} />
              <Input label="Venue" placeholder="e.g. Bride's Residence" value={evt.venue} onChange={(e) => updateEvent(evt.id, "venue", e.target.value)} />
            </div>
            <div className="mt-4 grid gap-4">
              <Textarea label="Address" placeholder="e.g. 456 Street Name" value={evt.address} onChange={(e) => updateEvent(evt.id, "address", e.target.value)} rows={2} />
              <Textarea label="Notes" placeholder="e.g. Dress code is yellow!" value={evt.notes} onChange={(e) => updateEvent(evt.id, "notes", e.target.value)} rows={2} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
