import mongoose from 'mongoose';

const useFallback = process.env.NODE_ENV === 'development' && (global.USE_IN_MEMORY_DB === true || !process.env.MONGODB_URI?.trim());

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

rsvpSchema.index({ invitationId: 1, createdAt: -1 });
rsvpSchema.index({ email: 1, invitationId: 1 });

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

  const sortItems = (items, sortObject = {}) => {
    const [[field, direction]] = Object.entries(sortObject);
    if (!field) return items;

    const sorted = [...items];
    Array.prototype.sort.call(sorted, (a, b) => {
      if (a[field] === b[field]) return 0;
      return direction === -1 ? (a[field] < b[field] ? 1 : -1) : (a[field] < b[field] ? -1 : 1);
    });
    return sorted;
  };

  const queryable = (items) => {
    const result = items.map((item) => toDocument({ ...item }));
    result.sort = (sortObject) => queryable(sortItems(items, sortObject));
    result.skip = (count) => queryable(items.slice(count));
    result.limit = (count) => queryable(items.slice(0, count));
    return result;
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
    find: (filter) => queryable(store.filter((item) => matchesFilter(item, filter))),
    findById: async (id) => {
      const item = store.find((record) => record._id.toString() === id.toString());
      return item ? toDocument({ ...item }) : null;
    },
    findByIdAndUpdate: async (id, update, options = {}) => {
      const index = store.findIndex((record) => record._id.toString() === id.toString());
      if (index < 0) return null;
      const nextUpdate = update && typeof update === 'object' && '$set' in update ? update.$set : update;
      store[index] = { ...store[index], ...nextUpdate, updatedAt: new Date() };
      return options.new ? toDocument({ ...store[index] }) : toDocument({ ...store[index] });
    },
    findByIdAndDelete: async (id) => {
      const index = store.findIndex((record) => record._id.toString() === id.toString());
      if (index < 0) return null;
      const [deleted] = store.splice(index, 1);
      return toDocument({ ...deleted });
    },
    countDocuments: async (filter) => store.filter((item) => matchesFilter(item, filter)).length,
  };
}

export default RSVP;

