import { Document, Model, Types } from "mongoose";
import { TURN_PHASE } from "./Room.interface";

export interface IVoteDocument extends Document {
	room: Types.ObjectId | string;
	trigger: Types.ObjectId | string;
	targeted?: Types.ObjectId | string;
	type: VOTE_ACTION;
	phase: TURN_PHASE,
	turn: number,
}

export interface IVote extends IVoteDocument {
	// writes your custom methods here.
}

export interface IVoteModel extends Model<IVote> {
	// writes your custom static fn here.
}

export enum VOTE_ACTION {
	'SKIP' = 'SKIP',
	'KILL' = 'KILL'
}
