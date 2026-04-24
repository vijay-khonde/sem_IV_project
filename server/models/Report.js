import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 150
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['drug_abuse', 'alcohol_abuse', 'suspicious_activity'],
    required: true
  },
  severityTags: [{
    type: String,
    enum: ['weapons_involved', 'minors_involved', 'group_activity', 'repeat_offense', 'overdose_risk']
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'resolved'],
    default: 'pending'
  },
  riskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  credibility: {
    type: Number,
    default: 1,
    min: 0,
    max: 1
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  resolvedAt: {
    type: Date
  },
  adminNote: {
    type: String,
    trim: true
  }
}, { timestamps: true });

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ riskScore: -1 });

export default mongoose.model('Report', reportSchema);
