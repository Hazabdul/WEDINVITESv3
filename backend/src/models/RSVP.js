import mongoose from 'mongoose';

const useFallback = process.env.NODE_ENV === 'development' && !process.env.MONGODB_URI;

const rsvpSchema = new mongoose.Schema({
  invitationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invitation',
    required: true,
  },
  guestName: {
    type: String,
    required: true,
  },
  email: String,
  phone: String,
  attending: {
    type: Boolean,
    required: true,
  },
  guestCount: {
    type: Number,
    default: 1,
  },
  message: String,
}, {
  timestamps: true,
});

let RSVP;

if (!useFallback) {
  RSVP = mongoose.model('RSVP', rsvpSchema);
} else {
  const store = [];

  const matchesFilter = (item, filter) => {
    return Object.entries(filter || {}).every(([key, value]) => item[key]?.toString() === value?.toString());
  };

  const toDocument = (data) => {
    return {
      ...data,
      toObject() {
        const doc = { ...this };
        delete doc.toObject;
        return doc;
      },
    };
  };

  RSVP = {
    create: async (data) => {
      const doc = toDocument({
        ...data,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      store.push({ ...doc });
      return doc;
    },
    find: async (filter) => {
      return store.filter((item) => matchesFilter(item, filter)).map((item) => toDocument({ ...item }));
    },
  };
}

export default RSVP;

