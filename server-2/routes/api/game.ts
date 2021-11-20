import express, { Request, Response } from "express";
import { Room } from "../../models/Room";
import { Vote } from "../../models/Vote";
import { IRoomDocument, PLAYER_STATUS, ROLE, ROOM_STATUS, TURN_PHASE } from "../../interface/Room.interface";
import { GameEvent } from "../../event/game.event";

const router = express.Router();

router.get('/:roomId', async (req: Request, res: Response) => {
	//Assign role
	const roomInfo = await Room.findById(req.params.roomId);
	if (!roomInfo || roomInfo.status === ROOM_STATUS.CLOSED) {
		return res.status(404).json({msg: 'cannot find the room'});
	}
	await Vote.deleteMany({
		roomId: roomInfo.id,
	});
	const initPlayerStatus = createInitialStatus(roomInfo);
	const initRoles = createInitialRoles(roomInfo);
	if (!initRoles) {
		return res.status(400).json({msg: "Wrong"})
	}
	roomInfo.roles = initRoles;
	roomInfo.playerStatus = initPlayerStatus;
	roomInfo.status = ROOM_STATUS.PLAYING;
	await roomInfo.save();
	const returnObject = roomInfo.toObject();
	// this event is global?
	GameEvent.eventEmitter.emit('ROOM_TURN_DAY_START', returnObject);
	// @ts-ignore // silent this error cause we know what we are doing
	returnObject.roles = returnObject.roles[req.user.id];
	return res.json(returnObject);
});

//POST players roles do vote
router.post('/:id/vote', async (req: Request, res: Response) => {
	const roomInfo = await Room.findById(req.params.id).select(['+roles']);
	if (!roomInfo) {
		return res.status(404).send('room khong ton tai`');
	}

	if (roomInfo.playerStatus[req.user.id] === 'DEAD') {
		return res.status(400).send('may chet roi`');
	}

	if (roomInfo.roles[req.user.id] === ROLE.VILLAGER) {
		if (roomInfo.phase === TURN_PHASE.NIGHT) {
			return res.status(400).json('bo lao vcl');
		}
	}

	return handleVote(roomInfo, req, res);
});

export = router;

function rollDice(remainRoles: ROLE[]) {
	if (remainRoles.length === 0) {
		return null;
	}

	const randomIndex = Math.floor(Math.random() * remainRoles.length);
	const randomRole = remainRoles[randomIndex];
	remainRoles.splice(randomIndex, 1);
	return randomRole;
}

function generateRolesOnNumberOfPlayer(amount: number) {
	const initialArr = [ROLE.WOLF, ROLE.VILLAGER];
	if (amount <= 2) {
		return initialArr;
	}
	for (let i = 0; i < amount - 2; i++) {
		initialArr.push(ROLE.VILLAGER);
	}
	return initialArr;
}

function createInitialRoles(roomInfo: IRoomDocument) {
	const remainRoles: ROLE[] = generateRolesOnNumberOfPlayer(roomInfo.players.length);
	const roles: {
		[userId: string]: ROLE
	} = {};
	/**
	 * P1: id=1
	 * P2: id=2
	 * P3: id=3
	 */
	roomInfo.players.forEach((player) => {
		const roleToAssign = rollDice(remainRoles);
		if (!roleToAssign) {
			return null;
		}
		roles[player.toString()] = roleToAssign;
	});
	return roles;
}

function createInitialStatus(roomInfo: IRoomDocument) {
	const playerStatus: {
		[userId: string]: PLAYER_STATUS
	} = {};
	roomInfo.players.forEach((player) => {
		playerStatus[player.toString()] = PLAYER_STATUS.ALIVE;
	})
	return playerStatus;
}

async function handleVote(roomInfo: IRoomDocument, req: Request, res: Response) {
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
