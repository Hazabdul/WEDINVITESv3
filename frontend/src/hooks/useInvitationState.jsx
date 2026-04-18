/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext } from 'react';
import { initialInvitationData } from '../data/mockData';

// Lazy reference so there's no circular dep — dimensions resolved at call time
const WIDGET_TYPES_META = {
  names:   { w: 340, h: 80  },
  date:    { w: 280, h: 60  },
  venue:   { w: 280, h: 60  },
  gallery: { w: 340, h: 200 },
  video:   { w: 340, h: 200 },
  quote:   { w: 300, h: 80  },
  family:  { w: 280, h: 80  },
  rsvp:    { w: 280, h: 80  },
  tag:     { w: 240, h: 60  },
  music:   { w: 240, h: 60  },
};

const InvitationContext = createContext();

const DEFAULT_CANVAS_WIDGETS = [
  { id: 'w-names',  type: 'names',  x: 40,  y: 40,  w: 320, h: 80  },
  { id: 'w-date',   type: 'date',   x: 40,  y: 140, w: 320, h: 60  },
  { id: 'w-venue',  type: 'venue',  x: 40,  y: 220, w: 320, h: 60  },
];

export function InvitationProvider({ children }) {
  const [data, setData] = useState({
    ...initialInvitationData,
    canvasWidgets: initialInvitationData.canvasWidgets || DEFAULT_CANVAS_WIDGETS,
  });
  const [designRegistry, setDesignRegistry] = useState({});
  const [selectedDesignElement, setSelectedDesignElement] = useState(null);

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
  const setPackage  = (id) => setData(prev => ({ ...prev, package: id }));

  const registerDesignElement = (id, meta = {}) => {
    setDesignRegistry((prev) => ({
      ...prev,
      [id]: {
        id,
        ...(prev[id] || {}),
        ...meta,
      },
    }));
  };

  const unregisterDesignElement = (id) => {
    setDesignRegistry((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelectedDesignElement((prev) => (prev === id ? null : prev));
  };

  /* ── Canvas Widget CRUD ──────────────────────────────── */
  const addCanvasWidget = (type, x = 40, y = 40) => {
    const def = WIDGET_TYPES_META[type] || {};
    const id = `w-${type}-${Date.now()}`;
    setData(prev => ({
      ...prev,
      canvasWidgets: [
        ...(prev.canvasWidgets || []),
        { id, type, x, y, w: def.w || 320, h: def.h || 80 },
      ],
    }));
  };

  const moveCanvasWidget = (id, x, y) => {
    setData(prev => ({
      ...prev,
      canvasWidgets: (prev.canvasWidgets || []).map(w =>
        w.id === id ? { ...w, x, y } : w
      ),
    }));
  };

  const resizeCanvasWidget = (id, w, h) => {
    setData(prev => ({
      ...prev,
      canvasWidgets: (prev.canvasWidgets || []).map(widget =>
        widget.id === id ? { ...widget, w, h } : widget
      ),
    }));
  };

  const removeCanvasWidget = (id) => {
    setData(prev => ({
      ...prev,
      canvasWidgets: (prev.canvasWidgets || []).filter(w => w.id !== id),
    }));
  };


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
      addCanvasWidget, moveCanvasWidget, resizeCanvasWidget, removeCanvasWidget,
      designRegistry, registerDesignElement, unregisterDesignElement,
      selectedDesignElement, setSelectedDesignElement,
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
