/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from 'react';
import { initialInvitationData } from '../data/mockData';

const InvitationContext = createContext();

export function InvitationProvider({ children }) {
  const [data, setData] = useState({
    ...initialInvitationData,
  });

  const updateSection = (section, field, value) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
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
        event.id === id ? { ...event, [field]: value } : event
      )
    }));
  };

  const addEvent = () => {
    setData((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: Date.now(),
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
      media: { coverImage: "", backgroundImage: "", brideImage: "", groomImage: "", coupleImage: "", gallery: [], video: "", music: "" },
      theme: initialInvitationData.theme,
      package: initialInvitationData.package
    });
  };

  return (
    <InvitationContext.Provider value={{
      data, updateSection, updatePosition, updateEvent,
      addEvent, setTemplate, setPackage, clearData,
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
