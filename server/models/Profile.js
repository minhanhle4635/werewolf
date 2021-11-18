const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  fullname: {
    type: String,
    required: true,
  },
  DoB: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);
