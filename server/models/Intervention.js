import mongoose from 'mongoose';

const interventionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['awareness_campaign', 'police_patrol', 'healthcare_outreach', 'rehabilitation_program'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  radius: {
    type: Number,
    default: 5000 // Impact radius in meters
  },
  status: {
    type: String,
    enum: ['planned', 'active', 'completed'],
    default: 'planned'
  },
  authorityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  riskReduction: {
    type: Number, // Percentage of risk reduction calculated after completion
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
}, { timestamps: true });

interventionSchema.index({ location: '2dsphere' });

export default mongoose.model('Intervention', interventionSchema);
