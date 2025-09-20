const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isEnabled: {
    type: Boolean,
    required: true,
    default: true
  },
  frequency: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 1440 // Maximum 24 hours (1440 minutes)
  },
  lastSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Method to check if user should receive a joke
userSchema.methods.shouldReceiveJoke = function() {
  if (!this.isEnabled) {
    return false;
  }
  
  if (!this.lastSentAt) {
    return true;
  }
  
  const now = new Date();
  const timeDiff = now - this.lastSentAt;
  const minutesDiff = timeDiff / (1000 * 60);
  
  return minutesDiff >= this.frequency;
};

// Method to update last sent timestamp
userSchema.methods.markJokeSent = function() {
  this.lastSentAt = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);