import express from 'express';
import { connectDB } from "./config/db";
import { Server, Socket } from "socket.io";
import * as http from "http";
import { IRoom, PLAYER_STATUS, TURN_PHASE } from "./interface/Room.interface";
import events from "events";
import { Room } from "./models/Room";
import { Vote } from "./models/Vote";
import AuthRoutes from './routes/api/auth';
import UserRoutes from './routes/api/users';
import ProfileRoutes from './routes/api/profile';
import RoomRoutes from './routes/api/room';
import GameRoutes from './routes/api/game';

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

		const votedFor: {
			[targetId: string]: number
		} = {};
		let skippedVote = 0;
		voteOnTurnPhase.forEach((vote) => {
			if (vote.type === 'SKIP') {
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
		/**
		 * User with the highest vote.
		 */
		const maxedID = Object.keys(votedFor).reduce((a, b) =>
			votedFor[a] > votedFor[b] ? a : b
		);
		if (votedFor[maxedID] > skippedVote) {
			// kill this bitch
			roomDB.playerStatus[maxedID] = PLAYER_STATUS.DEAD;
		}
		roomDB.phase = TURN_PHASE.NIGHT;
		await roomDB.save();
		eventEmitter.emit('ROOM_TURN_DAY_START', roomDB.toObject());
		// emit the voting result
		io.to(roomDB.id).emit('VOTE_COUNTED', roomDB);
	}, 30000);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} `));