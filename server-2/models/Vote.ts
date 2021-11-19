import { IVoteDocument, IVoteModel, VOTE_ACTION } from "../interface/Vote.interface";
import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { TURN_PHASE } from "../interface/Room.interface";

const VoterSchema: Schema<IVoteDocument> = new mongoose.Schema({
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'room',
		required: true,
	},
	trigger: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true,
	},
	targeted: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	phase: {
		type: String,
		enum: ['DAY', 'NIGHT'],
		default: TURN_PHASE.DAY,
	},
	turn: {
		type: Number,
		required: true,
		default: 1,
	},
	type: {
		type: String,
		enum: ['SKIP', 'KILL'],
		default: VOTE_ACTION.SKIP,
	},
});

export const Vote: IVoteModel = mongoose.model('voter', VoterSchema);
