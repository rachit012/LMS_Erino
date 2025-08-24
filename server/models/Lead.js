const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  first_name: {
    type: String,
    required: true,
    trim: true
  },
  last_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  source: {
    type: String,
    required: true,
    enum: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['new', 'contacted', 'qualified', 'lost', 'won']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  lead_value: {
    type: Number,
    required: true,
    min: 0
  },
  last_activity_at: {
    type: Date,
    default: null
  },
  is_qualified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

leadSchema.index({ user_id: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ created_at: 1 });

module.exports = mongoose.model('Lead', leadSchema);
