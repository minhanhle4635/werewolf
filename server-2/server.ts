import express from 'express';
import { connectDB } from "./config/db";
import { Server, Socket } from "socket.io";
import * as http from "http";
import { IRoom, IRoomDocument, PLAYER_STATUS, ROLE, TURN_PHASE } from "./interface/Room.interface";
import { Room } from "./models/Room";
import { Vote } from "./models/Vote";
import AuthRoutes from './routes/api/auth';
import UserRoutes from './routes/api/users';
import ProfileRoutes from './routes/api/profile';
import RoomRoutes from './routes/api/room';
import GameRoutes from './routes/api/game';
import { GameEvent } from "./event/game.event";
import { IVoteDocument, VOTE_ACTION } from "./interface/Vote.interface";
import { IUserDocument } from "./interface/User.interface";

const app = express();

// Connect to db
void connectDB();

// Init middleware
// app.use(express.json({extended: false})); // -> this option does not exist
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// defined routes
app.use('/api/auth', AuthRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/profile', ProfileRoutes);
app.use('/api/room', RoomRoutes);
app.use('/api/game', GameRoutes);

const server = http.createServer(app);
const io = new Server(server, {cors: {origin: '*'}})

// socket will emit event, which is why we have to listen it
io.on('connection', (socket: Socket) => {
	/**
	 * Create room event (emit from client)
	 */
	socket.on('CREATE_ROOM', (roomInformation: IRoom) => {
		socket.join(roomInformation.status);
	});

	/**
	 * Join room event
	 * client join
	 */
	socket.on('JOIN_ROOM', ({roomInformation, userJoined}) => {
		socket.join(roomInformation.id);
		io.to(roomInformation.id).emit('USER_JOINED', userJoined);
	});

	/**
	 * Join room event
	 * client join
	 */
	socket.on('RE_JOIN_ROOM', ({roomInformation, userJoined}) => {
		io.to(roomInformation.id).emit('USER_RE_JOINED', userJoined);
	});

	/**
	 * Leave room event
	 * client leave
	 * socket.leave(room._id, user);
	 */
	socket.on('LEAVE_ROOM', ({roomInformation, userLeave}) => {
		if (roomInformation.owner === userLeave._id) {
			io.to(roomInformation.id).emit('DISBAND_ROOM', null);
		} else {
			socket.to(roomInformation.id).emit('USER_LEAVE', userLeave);
		}
		socket.leave(roomInformation.id);
	});
});

GameEvent.eventEmitter.addListener('ROOM_TURN_DAY_START', async function (roomInfo) {
	if (roomInfo.status === 'CLOSED') {
		return;
	}
	setTimeout(async () => {
		// check the vote, update the room info, etc.
		const roomDB = await Room.findById(roomInfo.id).populate(['+players']);

		if (!roomDB || roomDB.status === 'CLOSED') {
			return;
		}

		const voteOnTurnPhase: IVoteDocument[] = await Vote.find({
			room: roomDB.id,
			turn: roomDB.turn,
			phase: roomDB.phase,
		});

		if (roomDB.phase === TURN_PHASE.NIGHT) {
			await countingNightVotes(roomDB, voteOnTurnPhase);
		} else {
			await countingDayVotes(roomDB, voteOnTurnPhase);
		}
	}, 30000);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} `));

async function countingDayVotes(room: IRoomDocument, voteOnTurnPhase: IVoteDocument[]) {
	const playerAlive = room.players.filter(playerId => room.playerStatus[playerId.toString()] === PLAYER_STATUS.ALIVE);
	const {votes, skip} = await countVote(room, voteOnTurnPhase, playerAlive);

	/**
	 * User with the highest vote.
	 */
	const maxedID = Object.keys(votes).reduce((a, b) =>
		votes[a] > votes[b] ? a : b
	);
	if (votes[maxedID] > skip) {
		// kill this bitch
		room.playerStatus[maxedID] = PLAYER_STATUS.DEAD;
	}
	room.phase = TURN_PHASE.NIGHT;
	await room.save();
	GameEvent.eventEmitter.emit('ROOM_TURN_DAY_START', room.toObject());
	// emit the voting result
	io.to(room.id).emit('VOTE_COUNTED', room);
}

async function countingNightVotes(room: IRoomDocument, voteOnTurnPhase: IVoteDocument[]) {
	const wolfAlive = room.players.filter(
		playerId => room.playerStatus[playerId.toString()] === PLAYER_STATUS.ALIVE &&
			room.roles[playerId.toString()] === ROLE.WOLF
	);
	const {votes, skip} = await countVote(room, voteOnTurnPhase, wolfAlive);
	/**
	 * User with the highest vote.
	 */
	const maxedID = Object.keys(votes).reduce((a, b) =>
		votes[a] > votes[b] ? a : b
	);
	if (room.roles[maxedID] !== ROLE.WOLF) {
		if (votes[maxedID] > skip) {
			// kill this bitch
			// only when the vote is correctly at the villager and is more than skipped vote.
			room.playerStatus[maxedID] = PLAYER_STATUS.DEAD;
		}
	}
	room.turn = room.turn + 1;
	room.phase = TURN_PHASE.DAY;
	await room.save();
	GameEvent.eventEmitter.emit('ROOM_TURN_DAY_START', room.toObject());
	// emit the voting result
	io.to(room.id).emit('VOTE_COUNTED', room);
}

async function countVote(room: IRoomDocument, voteOnTurnPhase: IVoteDocument[], playerAlive: IUserDocument[]) {
	if (voteOnTurnPhase.length < playerAlive.length) {
		await addMoreVote(room, voteOnTurnPhase, playerAlive);
	} else if (voteOnTurnPhase.length > playerAlive.length) {
		voteOnTurnPhase = await reduceLessVote(room, voteOnTurnPhase, playerAlive);
	}

	const votedFor: {
		[targetId: string]: number
	} = {};
	let skippedVote = 0;
	voteOnTurnPhase.forEach((vote) => {
		if (vote.type === VOTE_ACTION.SKIP) {
			skippedVote++;
		} else {
			const voteTargetId = vote.targeted!.toString();
			if (votedFor[voteTargetId] !== undefined) {
				votedFor[voteTargetId] = votedFor[voteTargetId] + 1;
			} else {
				votedFor[voteTargetId] = 1;
			}
		}
	});
	return {
		votes: votedFor,
		skip: skippedVote
	};
}

/**
 * Ensure the vote is correctly from the alive player, we add more temporary votes (for alive players but did not vote)
 * @param roomInfo
 * @param existedVote
 * @param ensureVoteForThese
 */
async function addMoreVote(roomInfo: IRoomDocument, existedVote: IVoteDocument[], ensureVoteForThese: IUserDocument[]) {
	const arrAdd: IVoteDocument[] = [];
	ensureVoteForThese.forEach(u => {
		const foundVote: IVoteDocument | undefined = existedVote.find(v => v.trigger.toString() === u._id.toString());
		if (!foundVote) {
			arrAdd.push(new Vote({
				room: roomInfo.id,
				trigger: u.id,
				phase: roomInfo.phase,
				turn: roomInfo.turn,
				type: VOTE_ACTION.SKIP
			}))
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
async function reduceLessVote(roomInfo: IRoomDocument, existedVote: IVoteDocument[], ensureVoteForThese: IUserDocument[]) {
	const arrReduce: IVoteDocument[] = [];
	ensureVoteForThese.forEach(u => {
		const foundVote: IVoteDocument | undefined = existedVote.find(v => v.trigger.toString() === u._id.toString());
		if (foundVote) {
			arrReduce.push(foundVote);
		}
	});
	return arrReduce;
}
