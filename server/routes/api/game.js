const express = require('express');
const Room = require('../../models/Room');
const Vote = require('../../models/Vote');
const router = express.Router();
const GameEvent = require('../../event/game.event');
const auth = require('../../middleware/auth');

/**
 * Start game
 */
router.get('/:roomId', auth, async (req, res) => {
  //Assign role
  const roomInfo = await Room.findById(req.params.roomId);

  if (!roomInfo || roomInfo.status === 'CLOSED') {
    return res.status(400).json({ msg: 'Wrong' });
  }
  await Vote.deleteMany({
    roomId: roomInfo.id,
  });
  const playerStatus = createInitialStatus(roomInfo);
  const initRoles = createInitialRoles(roomInfo);
  roomInfo.roles = initRoles;
  roomInfo.playerStatus = playerStatus;
  roomInfo.status = 'PLAYING';
  await roomInfo.save();

  const returnObject = roomInfo.toObject();
  // this event is global?
  GameEvent.eventEmitter.emit('ROOM_TURN_DAY_START', returnObject);
  returnObject.roles = returnObject.roles[req.user.id];
  return res.json(returnObject);
});

//POST players roles do vote
//Create a new schema: turn, phase, trigger, targeted
router.post('/:id/vote', async (req, res) => {
  const roomInfo = await Room.findById(req.params.id).select(['+roles']);

  if (!roomInfo) {
    return res.status(404).send('room khong ton tai`');
  }

  if (roomInfo.playerStatus[req.user.id] === 'DEAD') {
    return res.status(400).send('may chet roi`');
  }

  if (roomInfo.roles[req.user.id] === 'villager') {
    if (roomInfo.phase === 'NIGHT') {
      return res.status(400).json('bo lao vcl');
    }
  }

  return handleVote(roomInfo, req, res);
});

//function rollDice
function rollDice(remainRoles) {
  if (remainRoles.length === 0) {
    return null;
  }

  var randomIndex = Math.floor(Math.random() * remainRoles.length);
  var randomRole = remainRoles[randomIndex];
  remainRoles.splice(randomIndex, 1);

  return randomRole;
}

function generateRolesOnNumberOfPlayer(amount) {
  const initialArr = ['WOLF', 'VILLAGER'];
  if (amount <= 2) {
    return initialArr;
  }
  for (let i = 0; i < amount - 2; i++) {
    initialArr.push('VILLAGER');
  }
  return initialArr;
}

function createInitialRoles(roomInfo) {
  const remainRoles = generateRolesOnNumberOfPlayer(roomInfo.players.length);
  const roles = {};
  /**
   * P1: id=1
   * P2: id=2
   * P3: id=3
   */
  roomInfo.players.forEach((player) => {
    /**
     * x = id
     * P[x] <-- rollDice (random role)
     * roles[x] = rollDice
     * eg:
     *
     * {
     *    1: 'villager'
     *    2: 'woft',
     *    3: 'villager'
     * }
     *
     * eg: when access
     *
     * roles[user.id] === "villager"
     */
    const roleToAssign = rollDice(remainRoles);
    if (!roleToAssign) {
      return null;
    }
    roles[player.toString()] = roleToAssign;
  });
  return roles;
}

function createInitialStatus(roomInfo) {
  const playerStatus = {};
  roomInfo.players.forEach((player) => {
    playerStatus[player.toString()] = 'ALIVE';
  });
  return playerStatus;
}

async function handleVote(roomInfo, req, res) {
  const infoVote = {
    room: roomInfo.id,
    phase: roomInfo.phase,
    turn: roomInfo.turn,
    trigger: req.user.id,
  };
  const payloadVote = req.body;

  const alreadyVoted = await Vote.findOne(infoVote);

  if (alreadyVoted) {
    return res.status(400).send('may vote roi`');
  }

  if (payloadVote.type === 'SKIP') {
    // create vote and skip.
    const newVote = Object.assign({}, infoVote, {
      type: payloadVote.type,
    });

    const newVoteModel = await new Vote(newVote).save();
    return res.json(newVoteModel);
  }

  if (
    payloadVote.targeted.id === req.user.id ||
    roomInfo.playerStatus[payloadVote.targeted.id] === 'DEAD'
  ) {
    return res.status(400).send('target vote sai roi`');
  }

  // action now is KILL
  const newVote = Object.assign({}, infoVote, {
    type: payloadVote.type,
    targeted: payloadVote.targeted,
  });
  const newVoteModel = await new Vote(newVote).save();
  return res.json(newVoteModel);
}

module.exports = router;
