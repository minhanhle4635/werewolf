import express, { Request, Response } from "express";
import events from "events";
import { Room } from "../../models/Room";
import { Vote } from "../../models/Vote";
import { PLAYER_STATUS, ROLE, TURN_PHASE } from "../../interface/Room.interface";

const router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
	//Assign role
	const roomInfo = await Room.findById(req.params.roomId);
	if (!roomInfo) {
		return res.status(404).json({msg: 'cannot find the room'});
	}
	const voteInfo = await Vote.remove({
		roomId: roomInfo.id,
	});

	const remainRoles: ROLE[] = [
		// TODO: add roles here.
	]

	const roles: {
		[userId: string]: ROLE
	} = {};
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
		roles[player.id] = rollDice(remainRoles);
	});
	roomInfo.roles = roles;
	await roomInfo.save();

	// Create an eventEmitter object
	const eventEmitter = new events.EventEmitter();
	// this event is global?
	eventEmitter.emit('ROOM_TURN_DAY_START', roomInfo.toObject());

	let isTimeOut = false;
	const timeOutId = setTimeout(() => {
		//Trigger socket emit to all players that no one is killed
		isTimeOut = true;
	}, 15000);
});

//POST players roles do vote
router.post('/:id/vote', async (req: Request, res: Response) => {
	const roomInfo = await Room.findById(req.params.id).select(['+roles']);

	if (!roomInfo) {
		return res.status(404).json({msg: 'cannot find the room'})
	}

	let currentPhase = roomInfo.phase;
	if (currentPhase === TURN_PHASE.NIGHT && roomInfo.roles[req.user.id] === ROLE.VILLAGER) {
		return res.status(400).json({msg: 'bo lao vcl'});
	}

	if (roomInfo.playerStatus[req.user.id] === PLAYER_STATUS.DEAD) {
		return res.status(400).json({msg: 'may chet roi`'});
	}

	const infoVote = {
		room: roomInfo.id,
		phase: currentPhase,
		turn: roomInfo.turn,
		trigger: req.user.id,
	};
	const payloadVote = req.body;

	const alreadyVoted = await Vote.findOne(infoVote);

	if (alreadyVoted) {
		return res.status(400).json({msg: 'may vote roi`'});
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
		return res.status(400).json({msg: 'target vote sai roi`'});
	}

	// action now is KILL
	const newVote = Object.assign({}, infoVote, {
		type: payloadVote.type,
		targeted: payloadVote.targeted,
	});
	const newVoteModel = await new Vote(newVote).save();
	// roomInfo.playerStatus[newVote.targeted.id] = 'DEAD';
	// await roomInfo.save();
	return res.json(newVoteModel);
});

export = router;

function rollDice(remainRoles: ROLE[]): ROLE {
	throw new Error("Function not implemented.");
}

