const mongoose = require('mongoose');

function makeid(length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const LobbySchema = new mongoose.Schema({
  lobbyId: {
    type: String,
    required: true,
    default: makeid(8),
    unique: true,
  },
  players: {
    type: [String],
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
  },
  private: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = Lobby = mongoose.model('lobby', LobbySchema);
