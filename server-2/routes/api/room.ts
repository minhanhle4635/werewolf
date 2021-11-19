import express, { Request, Response } from "express";
import { auth } from "../../middleware/auth";
import { User } from "../../models/User";
import { Room } from "../../models/Room";
import { IRoomDocument, ROOM_STATUS } from "../../interface/Room.interface";
import { IUserDocument } from "../../interface/User.interface";

const router = express.Router();

//Create a room
router.post('/', [auth], async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.user.id);

		//Check if user already in any lobby
		const stayedRoom = await Room.find({
			status: ROOM_STATUS.OPEN,
			players: {$in: user!.id.toString()},
		});

		if (stayedRoom.length !== 0) {
			return res
				.status(400)
				.json({msg: 'Player already joined another room'});
		}

		const lobbyParticipants = [];
		lobbyParticipants.push(user);

		const {lobbyName, description, maxParticipants} = req.body;

		const newRoom = new Room({
			lobbyName: lobbyName,
			owner: user!._id,
			description: description,
			players: lobbyParticipants,
			maxParticipants: maxParticipants,
			status: ROOM_STATUS.OPEN,
		});

		// Created room record on MongoDB
		const room = await newRoom.save();

		const populatedRoom = await Room.populate(room, {path: 'players'});

		// Create a room on socket and join it
		// socket.emit("CREATE_ROOM", room);

		// return information of room.
		return res.json(populatedRoom);
	} catch (err) {
		console.log(err);
		return res.status(500).send('Server Error');
	}
});

/**
 * Get all Room
 */
router.get('/', [auth], async (req: Request, res: Response) => {
	try {
		const stayedRoom = await Room.find({
			status: ROOM_STATUS.OPEN,
			players: {$in: req.user.id},
		}).populate('owner', ['name', 'avatar']);

		if (stayedRoom.length === 0) {
			const rooms = await Room.find({status: ROOM_STATUS.OPEN})
				.sort({date: -1})
				.populate('owner', ['name', 'avatar']);
			return res.json(rooms);
		}
		return res.json(stayedRoom);
	} catch (err) {
		console.log(err);
		res.status(500).json('Server Error');
	}
});

//GET room info
router.get('/:id', auth, async (req: Request, res: Response) => {
	try {
		const stayedRoom = await Room.findOne({
			status: ROOM_STATUS.OPEN,
			players: {$in: req.user.id},
		}).select(['+roles']);

		let returnedRoom: IRoomDocument;

		if (!stayedRoom) {
			// TODO: recheck this logic???
			returnedRoom = (await Room.findById(req.params.id)
				.populate('players', ['name', 'avatar'])
				.select(['+roles']))!;
		} else {
			returnedRoom = stayedRoom;
		}

		// @ts-ignore // silent this error cause we know what we are doing
		returnedRoom.roles = returnedRoom.roles[req.user.id];
		/**
		 * roles = {
		 *    1: 'villager'
		 *    2: 'woft',
		 *    3: 'villager'
		 * }
		 * to
		 * roles = 'villager';
		 */
		return res.json(returnedRoom);
	} catch (err) {
		console.log(err);
		return res.status(500).json({msg: 'Server Error'});
	}
});

//PUT join room
/**
 * 1. User call this API to update room record on DB
 * 2. Server updated the record, join the socket room, then emit to the room for all the member (a new user joined)
 * 3. User on client navigate to page room/:id
 */
router.put('/join/:id', [auth], async (req: Request, res: Response) => {
	try {
		const room = await Room.findById(req.params.id).populate(['players']);
		if (!room) {
			return res.status(404).json({msg: 'cannot find the room'})
		}

		const user: IUserDocument = (await User.findById(req.user.id))!

		const previousRoom = await Room.find({
			status: ROOM_STATUS.OPEN,
			players: {$in: user._id},
			_id: {$ne: room._id},
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
			return res.status(400).json({msg: 'Player already joined lobby'});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).json({msg: 'Server Error'});
	}
});

//PUT Leave room
router.put('/leave/:id', auth, async (req: Request, res: Response) => {
	try {
		const room = await Room.findById(req.params.id);
		if (!room) {
			return res.status(404).json({msg: 'cannot find the room'})
		}
		const user = (await User.findById(req.user.id))!

		const userIndexInRoom = room.players.indexOf(user.id);

		if (userIndexInRoom === -1) {
			return res.json({msg: 'Player hasnt joined this room'});
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

		return res.json({msg: messageReturn});
	} catch (err) {
		console.log(err);
		return res.status(500).json({msg: 'Server error'});
	}
});

export = router;
