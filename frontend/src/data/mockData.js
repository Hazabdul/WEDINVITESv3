export const templatesList = [
  {
    id: "classic",
    name: "Classic Elegant",
    description: "Cream, gold, serif typography, timeless luxury.",
    badge: "Popular",
    palette: "from-amber-50 to-yellow-100",
    accent: "from-amber-300 via-yellow-200 to-stone-100",
    mood: "Timeless editorial",
    tagline: "Soft ivory layers, refined typography, and black-tie calm.",
    features: ["Editorial hero", "Photo ribbon", "Elegant story section"],
  },
  {
    id: "floral",
    name: "Floral Luxury",
    description: "Romantic floral styling with rich media sections.",
    badge: "Romantic",
    palette: "from-rose-50 to-pink-100",
    accent: "from-rose-300 via-pink-200 to-fuchsia-100",
    mood: "Romantic botanical",
    tagline: "Petal-toned gradients with a fashion-campaign softness.",
    features: ["Botanical visuals", "Romantic gallery", "Motion-ready hero"],
  },
  {
    id: "modern",
    name: "Minimal Modern",
    description: "Clean layouts with sleek contemporary spacing.",
    badge: "Modern",
    palette: "from-slate-50 to-gray-100",
    accent: "from-cyan-300 via-sky-300 to-violet-300",
    mood: "Cinematic minimal",
    tagline: "Dark glass surfaces and bold spacing for a luxury digital feel.",
    features: ["Glassmorphism", "Cinematic countdown", "Immersive dark mode"],
  },
  {
    id: "arabic",
    name: "Royal Arabic",
    description: "Dark luxury, gold accents, grand presentation.",
    badge: "Premium",
    palette: "from-stone-900 to-zinc-800",
    accent: "from-amber-500 via-yellow-300 to-orange-300",
    mood: "Majestic noir",
    tagline: "Gold-lit drama designed for formal evening celebrations.",
    features: ["Majestic framing", "Golden accents", "High-contrast elegance"],
  },
  {
    id: "traditional",
    name: "Traditional South Asian",
    description: "Maroon, gold, decorative celebratory design.",
    badge: "Cultural",
    palette: "from-red-900 to-orange-900",
    accent: "from-red-400 via-amber-300 to-yellow-100",
    mood: "Heritage luxe",
    tagline: "Ceremonial warmth with rich festive contrast and depth.",
    features: ["Heritage palette", "Decorative rhythm", "Ceremony-forward layout"],
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
    { id: 1, name: "Nikah", date: "2026-12-18", time: "05:00 PM", venue: "Grand Palace Hall", address: "Riyadh, Saudi Arabia", notes: "Please arrive 30 minutes early." },
    { id: 2, name: "Reception", date: "2026-12-19", time: "08:00 PM", venue: "Emerald Banquet", address: "Riyadh, Saudi Arabia", notes: "Dinner will be served." }
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
    id: "classic",
    primaryColor: "#b68d40",
    secondaryColor: "#f7e7ce",
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
