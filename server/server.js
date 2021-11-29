const express = require('express');
const connectDB = require('./config/db');
const GameEvent = require('./event/game.event');
const path = require('path');

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

// Socket is the client
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
    socket.broadcast.emit('USER_JOINED', userJoined);
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
      io.to(roomInformation._id).emit('USER_LEFT', userLeave._id);
    }
    socket.leave(roomInformation._id);
  });

  socket.on('ROOM_GENERATED', (generatedGameId) => {
    io.to(generatedGameId).emit('START_GAME', generatedGameId);
  });

  /**
   * Start game event
   * client join game
   */
  // socket.on('START_GAME', (roomInfor) => {
  //   console.log(roomInfor);
  //   /**
  //    * Khi ma room start -> owner start -> cho emit moi navigate
  //    * neu user ko o trong
  //    */
  //   // TODO
  // });
});

//Define Route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/room', require('./routes/api/room'));
app.use('/api/game', require('./routes/api/game'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} `));

//TODO: Change back to timeout 60s
GameEvent.eventEmitter.addListener(
  'ROOM_TURN_DAY_START',
  async function (roomInfo) {
    if (roomInfo.status === 'CLOSED') {
      return;
    }
    setTimeout(async () => {
      // check the vote, update the room info, etc.
      const roomDB = await Room.findById(roomInfo._id)
        .select(['+roles'])
        .populate(['players']);
      if (!roomDB || roomDB.status === 'CLOSED') {
        return;
      }
      const voteOnTurnPhase = await Vote.find({
        room: roomDB.id,
        turn: roomDB.turn,
        phase: roomDB.phase,
      });
      if (roomDB.phase === 'NIGHT') {
        await countingNightVotes(roomDB, voteOnTurnPhase);
      } else {
        await countingDayVotes(roomDB, voteOnTurnPhase);
      }
    }, 30000);
  }
);

async function countingDayVotes(room, voteOnTurnPhase) {
  const playerAlive = room.players.filter(
    (player) => room.playerStatus[player._id.toString()] === 'ALIVE'
  );
  const { votes, skip } = await countVote(room, voteOnTurnPhase, playerAlive);
  /**
   * User with the highest vote.
   */
  if (Object.keys(votes).length !== 0) {
    const maxedID = Object.keys(votes).reduce((a, b) =>
      votes[a] > votes[b] ? a : b
    );
    if (votes[maxedID] > skip) {
      // kill this bitch
      // make sure the playerStatus here does not get referred
      // to the original object from the `room` record.
      // I doubt that when we save the room, the reference point of
      // `room.playerStatus` make changes to our object, cause the object
      // to be reverted to the old state. or something like that.
      // JSON.parse/stringify to make sure the object we are passing
      // in will be independed.
      const playerStatus = JSON.parse(JSON.stringify(room.playerStatus));
      playerStatus[maxedID] = 'DEAD';
      room.playerStatus = playerStatus;
    }
  }
  const wolfAlive = playerAlive.filter(
    (player) => room.roles[player._id.toString()] === 'WOLF'
  );
  room.turnTimeStamp = new Date();
  if (
    wolfAlive.length >= playerAlive.length - wolfAlive.length ||
    wolfAlive.length === 0
  ) {
    room.status = 'CLOSED';
    await room.save();
    io.socket.to(room.id).emit('GAME_END');
  } else {
    // GameEvent.eventEmitter.emit('ROOM_TURN_DAY_START', room.toObject());
    room.phase = 'NIGHT';
    await room.save();
    io.to(room.id).emit('ABC');
    io.socket.to(room.id).emit('VOTE_COUNTED', room);
  }
}
async function countingNightVotes(room, voteOnTurnPhase) {
  const wolfAlive = room.players.filter(
    (player) =>
      room.playerStatus[player._id.toString()] === 'ALIVE' &&
      room.roles[player._id.toString()] === 'WOLF'
  );

  const playerAlive = room.players.filter(
    (player) => room.playerStatus[player._id.toString()] === 'ALIVE'
  );
  const { votes, skip } = await countVote(room, voteOnTurnPhase, wolfAlive);
  /**
   * User with the highest vote.
   */
  if (Object.keys(votes).length !== 0) {
    const maxedID = Object.keys(votes).reduce((a, b) =>
      votes[a] > votes[b] ? a : b
    );
    if (room.roles[maxedID] !== 'WOLF') {
      if (votes[maxedID] > skip) {
        // kill this bitch
        // only when the vote is correctly at the villager and is more than skipped vote.
        const playerStatus = room.playerStatus;
        playerStatus[maxedID] = 'DEAD';
        room.playerStatus = playerStatus;
      }
    }
  }
  room.turnTimeStamp = new Date();
  if (
    wolfAlive.length >= playerAlive.length - wolfAlive.length ||
    wolfAlive.length === 0
  ) {
    room.status = 'CLOSED';
    await room.save();
    io.socket.to(room.id).emit('GAME_END');
  } else {
    // GameEvent.eventEmitter.emit('ROOM_TURN_DAY_START', room.toObject());
    room.turn = room.turn + 1;
    room.phase = 'DAY';
    await room.save();
    const responseRoom = room.toObject();
    delete responseRoom.roles;
    io.socket.to(room.id).emit('VOTE_COUNTED', responseRoom);
  }
}
async function countVote(room, voteOnTurnPhase, playerAlive) {
  if (voteOnTurnPhase.length < playerAlive.length) {
    await addMoreVote(room, voteOnTurnPhase, playerAlive);
  } else if (voteOnTurnPhase.length > playerAlive.length) {
    voteOnTurnPhase = await reduceLessVote(room, voteOnTurnPhase, playerAlive);
  }
  const votedFor = {};
  let skippedVote = 0;
  voteOnTurnPhase.forEach((vote) => {
    if (vote.type === 'SKIP') {
      skippedVote++;
    } else {
      const voteTargetId = vote.targeted.toString();
      if (votedFor[voteTargetId] !== undefined) {
        votedFor[voteTargetId] = votedFor[voteTargetId] + 1;
      } else {
        votedFor[voteTargetId] = 1;
      }
    }
  });
  return {
    votes: votedFor,
    skip: skippedVote,
  };
}
/**
 * Ensure the vote is correctly from the alive player, we add more temporary votes (for alive players but did not vote)
 * @param roomInfo
 * @param existedVote
 * @param ensureVoteForThese
 */
async function addMoreVote(roomInfo, existedVote, ensureVoteForThese) {
  const arrAdd = [];
  ensureVoteForThese.forEach((u) => {
    const foundVote = existedVote.find(
      (v) => v.trigger.toString() === u._id.toString()
    );
    if (!foundVote) {
      arrAdd.push(
        new Vote({
          room: roomInfo.id,
          trigger: u.id,
          phase: roomInfo.phase,
          turn: roomInfo.turn,
          type: 'SKIP',
        })
      );
    }
  });
  // if want to save these temp votes.
  // await Vote.insertMany(arrAdd);
  existedVote.push(...arrAdd);
}
/**
 * Ensure the vote is correctly from the alive player, we reduce the vote (only get from the alive player)
 * @param roomInfo
 * @param existedVote
 * @param ensureVoteForThese
 */
async function reduceLessVote(roomInfo, existedVote, ensureVoteForThese) {
  const arrReduce = [];
  ensureVoteForThese.forEach((u) => {
    const foundVote = existedVote.find(
      (v) => v.trigger.toString() === u._id.toString()
    );
    if (foundVote) {
      arrReduce.push(foundVote);
    }
  });
  return arrReduce;
}
