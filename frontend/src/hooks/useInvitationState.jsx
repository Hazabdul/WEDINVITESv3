/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from 'react';
import { initialInvitationData } from '../data/mockData';

const InvitationContext = createContext();

export function InvitationProvider({ children }) {
  const [data, setData] = useState({
    ...initialInvitationData,
  });

  const updateSection = (section, field, value) => {
    setData((prev) => {
      const previousSection = prev[section] || {};
      const nextValue = typeof value === 'function'
        ? value(previousSection[field], previousSection, prev)
        : value;

      return {
        ...prev,
        [section]: {
          ...previousSection,
          [field]: nextValue
        }
      };
    });
  };

  const updatePosition = (id, config) => {
    setData((prev) => ({
      ...prev,
      positions: {
        ...(prev.positions || {}),
        [id]: { ...(prev.positions?.[id] || { x: 0, y: 0, scale: 1, color: '' }), ...config }
      }
    }));
  };

  const updateEvent = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.map((event) =>
        String(event.id) === String(id) ? { ...event, [field]: value } : event
      )
    }));
  };

  const addEvent = () => {
    const newId = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    setData((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: newId,
          name: "Custom Event",
          date: "",
          time: "",
          venue: "",
          address: "",
          notes: "",
        }
      ]
    }));
  };

  const removeEvent = (id) => {
    setData((prev) => ({
      ...prev,
      events: prev.events.filter((event) => String(event.id) !== String(id))
    }));
  };

  const setTemplate = (id) => updateSection('theme', 'id', id);
  const setPackage = (id) => setData(prev => ({ ...prev, package: id }));

  const clearData = () => {
    setData({
      couple: { bride: "", groom: "", title: "" },
      event: { date: "", time: "", venue: "", address: "", mapLink: "" },
      events: [],
      family: { brideParents: "", groomParents: "" },
      content: {
        welcomeHeading: "", introMessage: "", invitationText: "", quote: "", familyMessage: "", specialNotes: "", dressCode: "", rsvpText: "", contact1: "", contact2: ""
      },
      media: { coverImage: "", backgroundImage: "", brideImage: "", groomImage: "", coupleImage: "", gallery: [], enableVideo: false, video: "", music: "" },
      theme: { ...initialInvitationData.theme, enableVideo: false },
      package: initialInvitationData.package
    });
  };

  return (
    <InvitationContext.Provider value={{
      data, updateSection, updatePosition, updateEvent,
      addEvent, removeEvent, setTemplate, setPackage, clearData,
    }}>
      {children}
    </InvitationContext.Provider>
  );

}

export function useInvitationState() {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitationState must be used within an InvitationProvider');
  }
  return context;
}
