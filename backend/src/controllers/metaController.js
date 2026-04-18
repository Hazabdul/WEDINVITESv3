export const getTemplates = (req, res) => {
  const templates = [
    { id: 't1', name: 'Classic Gold', thumbnail: '/templates/classic-gold.jpg' },
    { id: 't2', name: 'Modern Minimal', thumbnail: '/templates/modern-minimal.jpg' },
    { id: 't3', name: 'Floral Garden', thumbnail: '/templates/floral-garden.jpg' },
    { id: 't4', name: 'Royal Velvet', thumbnail: '/templates/royal-velvet.jpg' },
  ];
  res.json(templates);
};

export const getPackages = (req, res) => {
  const packages = [
    { 
      id: 'BASIC', 
      name: 'Basic', 
      price: 29, 
      features: ['Digital Invitation', 'RSVP Tracking', 'Standard Themes'] 
    },
    { 
      id: 'STANDARD', 
      name: 'Standard', 
      price: 59, 
      features: ['Everything in Basic', 'Music Support', 'Gallery (5 images)', 'Custom Slug'] 
    },
    { 
      id: 'PREMIUM', 
      name: 'Premium', 
      price: 99, 
      features: ['Everything in Standard', 'Video Background', 'Gallery (20 images)', 'Draggable Custom Layout'] 
    },
  ];
  res.json(packages);
};
