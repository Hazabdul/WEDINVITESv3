import mongoose from 'mongoose';

const useFallback = process.env.NODE_ENV === 'development' && (global.USE_IN_MEMORY_DB === true || !process.env.MONGODB_URI?.trim());

export const DEFAULT_SITE_CONFIG = {
  key: 'default',
  siteName: 'Wedding Invites',
  supportEmail: '',
  supportPhone: '',
  whatsappNumber: '',
  announcement: '',
  maintenanceMode: false,
  brand: {
    logoUrl: '',
    primaryColor: '#876c57',
    secondaryColor: '#efe2d3',
  },
  payment: {
    provider: 'manual',
    currency: 'INR',
    upiVpa: 'triredglobal@upi',
    instructions: 'Pay once via UPI. Enter the transaction ID for manual verification.',
  },
  seo: {
    title: 'Wedding Invites',
    description: 'Create elegant digital wedding invitations.',
  },
  socialLinks: {},
};

const siteConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    default: 'default',
  },
  siteName: {
    type: String,
    default: DEFAULT_SITE_CONFIG.siteName,
  },
  supportEmail: String,
  supportPhone: String,
  whatsappNumber: String,
  announcement: String,
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  brand: mongoose.Schema.Types.Mixed,
  payment: mongoose.Schema.Types.Mixed,
  seo: mongoose.Schema.Types.Mixed,
  socialLinks: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

let SiteConfig;

if (!useFallback) {
  SiteConfig = mongoose.model('SiteConfig', siteConfigSchema);
} else {
  let config = {
    ...DEFAULT_SITE_CONFIG,
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  SiteConfig = {
    findOne: async () => ({
      ...config,
      toObject() {
        const doc = { ...this };
        delete doc.toObject;
        return doc;
      },
    }),
    findOneAndUpdate: async (filter, update, options = {}) => {
      const nextUpdate = update && typeof update === 'object' && '$set' in update ? update.$set : update;
      config = {
        ...config,
        ...nextUpdate,
        key: 'default',
        updatedAt: new Date(),
      };

      return options.lean ? { ...config } : {
        ...config,
        toObject() {
          const doc = { ...this };
          delete doc.toObject;
          return doc;
        },
      };
    },
  };
}

export default SiteConfig;
