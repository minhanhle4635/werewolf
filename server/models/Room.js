const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  players: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'user',
  },
  lobbyName: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  maxParticipants: {
    type: Number,
    enum: [10, 15],
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
});

module.exports = Room = mongoose.model('room', RoomSchema);
