import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
    default: 'ADMIN',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
