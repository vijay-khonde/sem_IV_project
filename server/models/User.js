import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  trustScore: {
    type: Number,
    default: 50, // 0-100 scale
    min: 0,
    max: 100
  },
  reportsSubmitted: {
    type: Number,
    default: 0
  },
  validReports: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
