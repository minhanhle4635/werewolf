const { response } = require('express');
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Lobby = require('../../models/Lobby');
const User = require('../../models/User');

// @route   POST api/lobby
// @desc    Create a lobby
// @access  Private
router.post('/', [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    var lobbyParticipants = [];
    lobbyParticipants.push(user.id.toString());
    console.log(lobbyParticipants);

    const newLobby = new Lobby({
      lobbyName: req.body.name,
      owner: user.id,
      description: req.body.description,
      players: lobbyParticipants,
      maxParticipants: req.body.maxParticipants,
      status: 'open',
    });

    const lobby = await newLobby.save();
    console.log(lobby);
    res.json(lobby);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/lobby
// @desc    get all lobbies
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const lobbies = await Lobby.find()
      .sort({ date: -1 })
      .populate('owner', ['name', 'avatar']);
    res.json(lobbies);
  } catch (e) {
    console.error(e.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/lobby/:id
// @desc    join lobby by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const givenLobby = await Lobby.findById(req.params.id);

    if (!lobby) {
      return res.status(404).json({ msg: 'Lobby not found' });
    }
    //Check if user already in any lobby
    const lobbies = await Lobby.find({ status: 'open' });
    lobbies.map((lobby) => {
      lobby.id === givenLobby.id
        ? givenLobby.players.map((player) => {
            player !== req.user.id.toString()
              ? givenLobby.players.push(req.user.id.toString())
              : res
                  .status(400)
                  .json({ msg: 'Player already stayed in this lobby' });
          })
        : lobby.players.map((player) => {
            player === req.user.id.toString() &&
              res
                .status(400)
                .json({ msg: 'Player already stayed in another lobby' });
          });
    });

    // const lobbies = await Lobby.find({ status: 'open' });
    // lobbies.map((lobby) =>
    //   lobby.players.map((player) => {
    //     player === req.user.id.toString() &&
    //       res
    //         .status(400)
    //         .json({ msg: 'Player already stayed in another lobby' });
    //   })
    // );

    //Check if user already in this lobby

    // lobby.players.map((player) => {
    //   player !== req.user.id.toString()
    //     (?) lobby.players.push(req.user.id.toString())
    //     : res.status(400).json({ msg: 'Player already stayed in this lobby' });
    // });
    await lobby.save();
    res.json(lobby);
  } catch (e) {
    console.error(e.message);
    if (e.kind == 'ObjectId') {
      return res.status(404).json({ msg: 'Lobby not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   Delete api/posts/:id
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
    res.status(500).send('Server Error');
  }
});

module.exports = router;
