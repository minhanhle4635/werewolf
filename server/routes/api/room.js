const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Room = require('../../models/Room');

//Create a room
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    //Check if user already in any lobby
    const stayedRoom = await Room.find({
      status: 'open',
      players: { $in: user.id.toString() },
    });

    if (stayedRoom.length !== 0) {
      return res
        .status(400)
        .json({ msg: 'Player already joined another room' });
    }

    const lobbyParticipants = [];
    lobbyParticipants.push(user);

    const { lobbyName, description, maxParticipants } = req.body;

    const newRoom = new Room({
      lobbyName: lobbyName,
      owner: user._id,
      description: description,
      players: lobbyParticipants,
      maxParticipants: maxParticipants,
      status: 'open',
    });

    // Created room record on MongoDB
    const room = await newRoom.save();

    const populatedRoom = await Room.populate(room, { path: 'players' });

    // Create a room on socket and join it
    // socket.emit("CREATE_ROOM", room);

    // return information of room.
    return res.json(populatedRoom);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

//Get all Room
router.get('/', auth, async (req, res) => {
  try {
    const stayedRoom = await Room.find({
      status: 'open',
      players: { $in: req.user.id },
    }).populate('owner', ['name', 'avatar']);

    if (stayedRoom.length === 0) {
      const rooms = await Room.find({ status: 'open' })
        .sort({ date: -1 })
        .populate('owner', ['name', 'avatar']);
      return res.json(rooms);
    } else {
      return res.json(stayedRoom);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json('Server Error');
  }
});

//GET room info
router.get('/:id', auth, async (req, res) => {
  try {
    const stayedRoom = await Room.find({
      status: 'open',
      players: { $in: req.user.id },
    });

    if (stayedRoom.length === 0) {
      const givenRoom = await Room.findById(req.params.id).populate('players', [
        'name',
        'avatar',
      ]);
      return res.json(givenRoom);
    } else {
      return res.json(stayedRoom[0]);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//PUT join room
/**
 * 1. User call this API to update room record on DB
 * 2. Server updated the record, join the socket room, then emit to the room for all the member (a new user joined)
 * 3. User on client navigate to page room/:id
 */
router.put('/join/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(['players']);
    const user = await User.findById(req.user.id).select(['-password']);

    const previousRoom = await Room.find({
      status: 'open',
      players: { $in: user._id },
      _id: { $ne: room._id },
    });

    if (previousRoom.length === 0) {
      // If user joined this current room already. then not increase
      // user in this room.
      if (!room.players.find((u) => u.id === user.id)) {
        room.players.push(user);
        await room.save();
      }
      return res.json(room);
    } else {
      return res.status(400).json({ msg: 'Player already joined lobby' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Server Error' });
  }
});

//PUT Leave room
router.put('/leave/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    const user = await User.findById(req.user.id).select('-password');

    const userIndexInRoom = room.players.indexOf(user.id);

    if (userIndexInRoom === -1) {
      return res.json({ msg: 'Player hasnt joined this room' });
    }

    // remove this user from list player.
    room.players.splice(userIndexInRoom, 1);
    let messageReturn = 'You have left the room.';

    if (room.owner === user._id) {
      // this user is the owner, we need to discard this room.
      messageReturn = 'This room is now disbanded.';
      // save to DB
      await room.remove();
    } else {
      // save to DB
      await room.save();
    }

    return res.json({ msg: messageReturn });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;