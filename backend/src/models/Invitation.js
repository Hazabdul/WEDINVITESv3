import mongoose from 'mongoose';

const useFallback = process.env.NODE_ENV === 'development' && (global.USE_IN_MEMORY_DB === true || !process.env.MONGODB_URI?.trim());

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: String,
  time: String,
  venue: String,
  address: String,
  notes: String,
});

const widgetSchema = new mongoose.Schema({
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: Number,
  h: Number,
  config: mongoose.Schema.Types.Mixed,
});

const invitationSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  package: {
    type: String,
    enum: ['BASIC', 'STANDARD', 'PREMIUM'],
    default: 'BASIC',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
  },
  brideName: String,
  groomName: String,
  weddingDate: Date,
  couple: mongoose.Schema.Types.Mixed,
  event: mongoose.Schema.Types.Mixed,
  family: mongoose.Schema.Types.Mixed,
  content: mongoose.Schema.Types.Mixed,
  media: mongoose.Schema.Types.Mixed,
  theme: mongoose.Schema.Types.Mixed,
  positions: mongoose.Schema.Types.Mixed,
  events: [eventSchema],
  widgets: [widgetSchema],
}, {
  timestamps: true,
});

let Invitation;

if (!useFallback) {
  Invitation = mongoose.model('Invitation', invitationSchema);
} else {
  const store = [];

  const matchesFilter = (item, filter) => {
    return Object.entries(filter || {}).every(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.entries(value).every(([operator, condition]) => {
          if (operator === '$in') {
            return condition.includes(item[key]);
          }
          return item[key] === condition;
        });
      }
      return item[key] === value;
    });
  };

  const toDocument = (data) => {
    return {
      ...data,
      toObject() {
        const doc = { ...this };
        delete doc.save;
        delete doc.toObject;
        return doc;
      },
      save: async function () {
        const existingIndex = store.findIndex((record) => record._id.toString() === this._id.toString());
        this.updatedAt = new Date();
        if (existingIndex >= 0) {
          store[existingIndex] = { ...store[existingIndex], ...this };
        } else {
          store.push({ ...this });
        }
        return this;
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

  const queryable = (items, asLean = false) => {
    const result = Array.from(asLean ? items.map((item) => ({ ...item })) : items.map((item) => toDocument({ ...item })));

    result.sort = (sortObject) => queryable(sortItems(items, sortObject), asLean);
    result.skip = (count) => queryable(items.slice(count), asLean);
    result.limit = (count) => queryable(items.slice(0, count), asLean);
    result.lean = () => queryable(items, true);

    return result;
  };

  Invitation = {
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
    findOne: async (filter) => {
      const item = store.find((record) => matchesFilter(record, filter));
      return item ? toDocument({ ...item }) : null;
    },
    findById: async (id) => {
      const item = store.find((record) => record._id.toString() === id.toString());
      return item ? toDocument({ ...item }) : null;
    },
    findByIdAndUpdate: async (id, update, options = {}) => {
      const index = store.findIndex((record) => record._id.toString() === id.toString());
      if (index < 0) return null;
      const nextUpdate = update && typeof update === 'object' && '$set' in update
        ? update.$set
        : update;
      store[index] = { ...store[index], ...nextUpdate, updatedAt: new Date() };
      return options.new ? toDocument({ ...store[index] }) : toDocument({ ...store[index] });
    },
    countDocuments: async (filter) => store.filter((item) => matchesFilter(item, filter)).length,
  };
}

export default Invitation;
