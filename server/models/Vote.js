const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room',
    required: true,
  },
  trigger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  targeted: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  phase: {
    type: String,
    enum: ['DAY', 'NIGHT'],
    default: 'DAY',
  },
  turn: {
    type: Number,
    required: true,
    default: 1,
  },
  type: {
    type: String,
    enum: ['SKIP', 'KILL'],
    default: 'SKIP',
  },
});

module.exports = Voter = mongoose.model('voter', VoterSchema);
