import { Document, Model } from "mongoose";
import { IUserDocument } from "./User.interface";

export interface IRoomDocument extends Document {
	owner: IUserDocument | string;
	lobbyName: string;
	date: Date;
	description: string;
	maxParticipants: number;
	players: IUserDocument[];
	roles: {
		[userId: string]: ROLE
	},
	playerStatus: {
		[userId: string]: PLAYER_STATUS
	}
	phase: TURN_PHASE,
	turn: number,
	status: ROOM_STATUS;
}

export interface IRoom extends IRoomDocument {
	// writes your custom methods here.
}

export interface IRoomModel extends Model<IRoom> {
	// writes your custom static fn here.
}

export enum ROOM_STATUS {
	'OPEN' = 'OPEN',
	'CLOSED' = 'CLOSED',
	'PLAYING' = 'PLAYING',
}

export enum ROLE {
	VILLAGER = 'VILLAGER',
	WOLF = 'WOLF',
}

export enum PLAYER_STATUS {
	DEAD = 'DEAD',
	ALIVE = 'ALIVE',
}

export enum TURN_PHASE {
	'DAY' = 'DAY',
	'NIGHT' = 'NIGHT'
}
