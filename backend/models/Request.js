const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: String,
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  pickupTime: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  expiresAt: Date // Auto-delete time (2 hours after acceptance)
});

module.exports = mongoose.model('Request', requestSchema);
