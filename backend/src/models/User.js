import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'],
    default: 'ADMIN',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'DISABLED'],
    default: 'ACTIVE',
  },
  lastLoginAt: Date,
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
