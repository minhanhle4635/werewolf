const { response } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Lobby = require('../../models/Lobby');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { remove } = require('../../models/User');

// @route   POST api/lobby
// @desc    Create a lobby
// @access  Private
router.post('/', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    //Check if user already in any lobby
    const stayedLobby = await Lobby.find({
      status: 'open',
      players: { $in: user.id.toString() },
    });

    if (stayedLobby.length === 0) {
      var lobbyParticipants = [];
      lobbyParticipants.push(user.id);

      const privacyStatus = req.body.privacyStatus;
      var hasedPassword;
      if (privacyStatus === 'Private') {
        const salt = await bcrypt.genSalt(10);
        hasedPassword = await bcrypt.hash(req.body.password, salt);
      } else {
        hasedPassword = '';
      }

      const newLobby = new Lobby({
        lobbyName: req.body.lobbyName,
        owner: user.id,
        description: req.body.description,
        players: lobbyParticipants,
        maxParticipants: req.body.maxParticipants,
        status: 'open',
        privacyStatus: req.body.privacyStatus,
        password: hasedPassword,
      });

      const lobby = await newLobby.save();
      res.json(lobby);
    } else {
      return res
        .status(400)
        .json({ msg: 'Player already joined another room' });
    }
  } catch (e) {
    console.error(e.message);
    return res.status(500).send('Server Error');
  }
});

// @route   GET api/lobby
// @desc    get all lobbies
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    //get your lobby
    const stayedLobby = await Lobby.find({
      status: 'open',
      players: { $in: req.user.id },
    }).populate('owner', ['name', 'avatar']);

    if (stayedLobby.length === 0) {
      const lobbies = await Lobby.find({
        status: 'open',
      })
        .sort({ date: -1 })
        .populate('owner', ['name', 'avatar']);
      return res.json(lobbies);
    } else {
      return res.json(stayedLobby);
    }
  } catch (e) {
    console.error(e.message);
    return res.status(500).json('Server Error');
  }
});

// @route   GET api/lobby/:id
// @desc    join lobby by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // const givenLobby = await Lobby.findById(req.params.id);

    // if (!givenLobby) {
    //   return res.status(404).json({ msg: 'Lobby not found' });
    // }

    // const currentUserId = req.user.id.toString();
    // //Find room that has current user inside
    // const stayedLobby = await Lobby.find({
    //   status: 'open',
    //   players: { $in: currentUserId },
    // });

    // //check if he is inside any room
    // if (stayedLobby.length === 0) {
    //   if (givenLobby.privacyStatus === 'Public') {
    //     givenLobby.players.push(currentUserId.toString());
    //     await givenLobby.save();
    //     res.json(givenLobby);
    //   } else {
    //     const password = req.body.password;
    //     if (!password) {
    //       res.status(400).json({ msg: 'Password invalid' });
    //     } else {
    //       bcrypt.compare(
    //         password,
    //         givenLobby.password,
    //         async function (err, isValid) {
    //           if (err) {
    //             return res.status(500).json({ msg: 'Server Error' });
    //           } else if (isValid) {
    //             givenLobby.players.push(currentUserId.toString());
    //             await givenLobby.save();
    //             console.log(givenLobby);
    //             res.json(givenLobby);
    //           } else {
    //             return res.status(400).json({ msg: 'Wrong Password' });
    //           }
    //         }
    //       );
    //     }
    //   }
    // } else if (stayedLobby[0].id === givenLobby.id) {
    //   console.log(stayedLobby[0]);
    //   res.json(stayedLobby[0]);
    // } else {
    //   return res
    //     .status(400)
    //     .json({ msg: 'This player already joined another lobby' });
    // }
    const givenLobby = await Lobby.findById(req.params.id).populate('players', [
      'name',
      'avatar',
    ]);

    if (!givenLobby) {
      return res.status(404).json({ msg: 'Lobby not found' });
    }
    res.json(givenLobby);
  } catch (e) {
    console.error(e.message);
    if (e.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Lobby not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   Delete api/lobby/:id
// @desc    Disband lobby
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);

    if (!lobby) {
      return res.status(404).json({ msg: 'Lobby not found' });
    }

    //Check on the user
    if (lobby.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await lobby.remove();

    res.json({ msg: 'Lobby Disbanded' });
  } catch (e) {
    console.error(e.message);
    if (e.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Lobby not found' });
    }
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/lobby/:id
// @desc    Join lobby
// @access  Private
router.put('/join/:id', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    const user = await User.findById(req.user.id);

    const stayedLobby = await Lobby.find({
      status: 'open',
      players: { $in: user.id },
    });

    if (stayedLobby.length === 0) {
      lobby.players.push(user.id);
    } else {
      return res.status(400).json({ msg: 'Player already joined lobby' });
    }

    await lobby.save();
    res.json(lobby);
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/:id
// @desc    Leave lobby
// @access  Private
router.put('/leave/:id', auth, async (req, res) => {
  try {
    const lobby = await Lobby.findById(req.params.id);
    const user = await User.findById(req.user.id);

    const removeIndex = lobby.players.indexOf(user.id, 0);
    // console.log(removeIndex);
    const removeUserId = lobby.players[removeIndex];
    const checkUser = await User.findById(removeUserId);

    if (!checkUser) {
      res.json({ msg: 'Player hasnt join this room' });
    } else if (checkUser.id === user.id) {
      if (checkUser.id !== lobby.owner.toString()) {
        lobby.players.splice(removeIndex, 1);
        await lobby.save();
        res.json(lobby);
      } else {
        await lobby.remove();
        res.json({ msg: 'Lobby Disbanded' });
      }
    } else {
      res.json(lobby);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
