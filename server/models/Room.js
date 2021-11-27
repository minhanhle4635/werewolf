const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  players: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'user',
  },
  // {[_id: string]: string (role)}
  roles: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    select: false,
  },
  // Alive or Dead Status
  // {[_id: string]: string (DEAD|ALIVE)}
  playerStatus: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
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
  turnTimeStamp: {
    type: Date,
    default: null,
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
    default: new Date(),
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
    enum: ['OPEN', 'PLAYING', 'CLOSED'],
    default: 'OPEN',
  },
});

module.exports = Room = mongoose.model('room', RoomSchema);
