export const templatesList = [
  {
    id: "ceremony",
    name: "Ceremony Portrait",
    description: "Quiet portrait-led storytelling with family details and a ceremonial tone.",
    badge: "New",
    palette: "from-stone-100 to-amber-50",
    accent: "from-[#d9c1ac] via-[#efe3d3] to-[#f8f2eb]",
    mood: "Ceremonial portrait",
    tagline: "A softer, invitation-first layout inspired by formal wedding microsites and family introductions.",
    features: ["Portrait-led hero", "Family introduction", "Ceremony story flow"],
  },
];

export const packagesList = [
  {
    id: "basic",
    name: "Basic",
    price: "₹999",
    priceINR: 999,
    features: ["1 standard template", "Event details", "Image gallery", "Basic preview"],
  },
  {
    id: "standard",
    name: "Standard",
    price: "₹1,999",
    priceINR: 1999,
    featured: true,
    features: ["Everything in Basic", "Countdown timer", "RSVP section", "Music support", "More customization"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹3,499",
    priceINR: 3499,
    features: ["Everything in Standard", "Premium templates", "Video section", "Advanced styling", "Best visual effects"],
  },
];

export const initialInvitationData = {
  couple: {
    bride: "Aaliyah",
    groom: "Omar",
    title: "Together with their families"
  },
  event: {
    date: "2026-12-18",
    time: "07:30 PM",
    venue: "The Grand Pearl Ballroom",
    address: "King Fahd Road, Riyadh, Saudi Arabia",
    mapLink: "https://maps.google.com"
  },
  events: [
    { id: "1", name: "Nikah", date: "2026-12-18", time: "05:00 PM", venue: "Grand Palace Hall", address: "Riyadh, Saudi Arabia", notes: "Please arrive 30 minutes early." },
    { id: "2", name: "Reception", date: "2026-12-19", time: "08:00 PM", venue: "Emerald Banquet", address: "Riyadh, Saudi Arabia", notes: "Dinner will be served." }
  ],
  family: {
    brideParents: "Mr. & Mrs. Rahman",
    groomParents: "Mr. & Mrs. Kareem"
  },
  content: {
    welcomeHeading: "We Invite You to Celebrate Our Wedding",
    introMessage: "With joy in our hearts, we invite you to share in the beauty of our special day.",
    invitationText: "We request the pleasure of your company as we unite in love, faith, and celebration.",
    quote: "And among His signs is that He created for you mates from among yourselves.",
    familyMessage: "Your presence and blessings mean the world to our families.",
    specialNotes: "Separate family seating arranged. Kindly arrive on time.",
    dressCode: "Formal / Traditional",
    rsvpText: "Please confirm your attendance before December 1st, 2026.",
    contact1: "+966 500 000 000",
    contact2: "+966 511 111 111"
  },
  media: {
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    backgroundImage: "https://images.unsplash.com/photo-1516557070061-c3d1653fa646?auto=format&fit=crop&w=1400&q=80",
    brideImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    groomImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    coupleImage: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80",
    ],
    video: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    music: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
  },
  theme: {
    id: "ceremony",
    primaryColor: "#876c57",
    secondaryColor: "#efe2d3",
    font: "serif",
    backgroundStyle: "soft-gradient",
    borderStyle: "rounded",
    sectionShape: "rounded-3xl",
    enableAnimation: true,
    enableCountdown: true,
    enableGallery: true,
    enableVideo: true,
    enableMusic: false
  },
  package: "standard"
};
