export const templatesList = [
  {
    id: "mountain",
    name: "High-End Immersive",
    description: "An ultra-premium cinematic experience with deep emerald tones, golden accents, and delicate petal animations.",
    badge: "Exclusive",
    palette: "from-[#1e3d2f] to-[#1e3d2f]",
    accent: "from-[#c9a87c] via-[#f5ede0] to-[#c9a87c]",
    mood: "High-End Immersive",
    tagline: "Wowed at first glance with vibrant colors, elegant transitions, and a premium editorial feel.",
    features: ["Floating petals", "Heartbeat animations", "Emerald & Gold theme"],
    previewImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "noir",
    name: "Noir Editorial",
    description: "A bold, high-contrast modern design with dramatic typography and minimalist layouts.",
    badge: "New",
    palette: "from-black to-black",
    accent: "from-black via-zinc-900 to-black",
    mood: "Modern Editorial",
    tagline: "Bold, brave, and undeniably modern for the trend-setting couple.",
    features: ["High-contrast typography", "Cinematic reveals", "Minimalist aesthetic"],
    previewImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "solstice",
    name: "Solstice Minimal",
    description: "Soft, organic botanical design with delicate serif typography and natural textures.",
    badge: "Romantic",
    palette: "from-[#FDFCFB] to-[#FDFCFB]",
    accent: "from-[#FDFCFB] via-[#F4EFEA] to-[#FDFCFB]",
    mood: "Organic Minimalist",
    tagline: "A breath of fresh air with soft tones and natural, flowing elegance.",
    features: ["Botanical accents", "Organic shapes", "Soft, clean layout"],
    previewImage: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
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
    { id: "1", name: "Nikah", date: "2026-12-18", time: "05:00 PM", venue: "Grand Palace Hall", address: "Riyadh, Saudi Arabia", notes: "Please arrive 30 minutes early.", image: "/img2.jpg" },
    { id: "2", name: "Reception", date: "2026-12-19", time: "08:00 PM", venue: "Emerald Banquet", address: "Riyadh, Saudi Arabia", notes: "Dinner will be served.", image: "/img3.jpg" }
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
    coverImage: "/banner_image.jpg",
    backgroundImage: "/banner_image.jpg",
    brideImage: "/bride.jpg",
    groomImage: "/groom.jpg",
    coupleImage: "/banner_image.jpg",
    gallery: [
      "/img1.jpg",
      "/img2.jpg",
      "/img3.jpg",
      "/img4.jpg",
      "/banner_image.jpg",
      "/groom.jpg"
    ],
    enableVideo: true,
    video: "/banner_video.mp4",
    music: "/music/music1.mp3"
  },
  theme: {
    id: "mountain",
    primaryColor: "#876c57",
    secondaryColor: "#efe2d3",
    headingColor: "#6f5642",
    subheadingColor: "#876c57",
    bodyColor: "#705f53",
    metaColor: "#9a7d66",
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
