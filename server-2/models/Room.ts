import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IRoomDocument, IRoomModel, ROOM_STATUS, TURN_PHASE } from "../interface/Room.interface";

const RoomSchema: Schema<IRoomDocument> = new mongoose.Schema({
	players: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'user',
	},
	playerStatus: {
		type: mongoose.Schema.Types.Mixed,
		default: {},
		required: true
	},
	roles: {
		type: mongoose.Schema.Types.Mixed,
		default: {},
		select: false
	},
	lobbyName: {
		type: String,
		required: true,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	date: {
		type: Date,
		default: new Date(),
	},
	description: {
		type: String,
	},
	maxParticipants: {
		type: Number,
		enum: [10, 15],
		required: true,
		default: 10
	},
	turn: {
		type: Number,
		required: true,
		default: 1
	},
	phase: {
		type: String,
		enum: ['DAY', 'NIGHT'],
		required: true,
		default: TURN_PHASE.DAY
	},
	status: {
		type: String,
		enum: ['OPEN', 'CLOSED', 'PLAYING'],
		default: ROOM_STATUS.OPEN,
	},
});

export const Room: IRoomModel = mongoose.model('room', RoomSchema);
