const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const events = require('events');

const app = express();

//connect to db
connectDB();

//Init middleware
app.use(express.json({ extended: false }));

//setup socket
let http = require('http');
const Room = require('./models/Room');
const Vote = require('./models/Vote');
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

// Socket is the fuckin client
// socket will emit event, which is why we have to listen it
io.on('connection', (socket) => {
  /**
   * Create room event (emit from client)
   */
  socket.on('CREATE_ROOM', (roomInformation) => {
    socket.join(roomInformation._id);
  });

  /**
   * Join room event
   * client join
   */
  socket.on('JOIN_ROOM', ({ roomInformation, userJoined }) => {
    socket.join(roomInformation._id);
    console.log(roomInformation);
    io.to(roomInformation._id).emit('USER_JOINED', userJoined);
  });

  /**
   * Join room event
   * client join
   */
  socket.on('RE_JOIN_ROOM', ({ roomInformation, userJoined }) => {
    io.to(roomInformation._id).emit('USER_RE_JOINED', userJoined);
  });

  /**
   * Leave room event
   * client leave
   * socket.leave(room._id, user);
   */
  socket.on('LEAVE_ROOM', ({ roomInformation, userLeave }) => {
    if (roomInformation.owner === userLeave._id) {
      io.to(roomInformation._id).emit('DISBAND_ROOM', null);
    } else {
      socket.to(roomInformation._id).emit('USER_LEAVE', userLeave);
    }
    socket.leave(roomInformation._id);
  });

  /**
   *
   */
});

//Define Route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/room', require('./routes/api/room'));
app.use('/api/game', require('./routes/api/game'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} `));

const eventEmitter = new events.EventEmitter();

eventEmitter.addListener('ROOM_TURN_DAY_START', async function (roomInfo) {
  if (roomInfo.status === 'CLOSED') {
    return;
  }
  setTimeout(async () => {
    // check the vote, update the room info, etc.
    const roomDB = await Room.findById(roomInfo.id);

    if (!roomDB || roomDB.status === 'CLOSED') {
      return;
    }

    const voteOnTurnPhase = await Vote.find({
      room: roomDB.id,
      turn: roomDB.turn,
      phase: roomDB.phase,
    });

    const votedFor = {
      // [targetId]: [amount of vote]
    };
    let skippedVote = 0;
    voteOnTurnPhase.forEach((vote) => {
      if (vote.type === 'SKIP') {
        skippedVote++;
      } else {
        if (votedFor[vote.targetted] !== undefined) {
          votedFor[vote.targetted] = votedFor[vote.targetted] + 1;
        } else {
          votedFor[vote.targetted] = 1;
        }
      }
    });
    /**
     * User with the highest vote.
     */
    const maxedID = Object.keys(votedFor).reduce((a, b) =>
      votedFor[a] > votedFor[b] ? a : b
    );
    if (votedFor[maxedID] > skippedVote) {
      // kill this bitch
      roomDB.playerStatus[maxedID] = 'DEAD';
    }
    roomDB.phase = 'NIGHT';
    await roomDB.save();
    eventEmitter.emit('ROOM_TURN_DAY_START', roomDB.toObject());
    // emit the voting result
    io.to(roomDB._id).emit('VOTE_COUNTED', roomDB);
  }, 30000);
});
