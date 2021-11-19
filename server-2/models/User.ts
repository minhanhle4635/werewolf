import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IUser, IUserDocument, IUserModel } from "../interface/User.interface";

const UserSchema: Schema<IUserDocument> = new mongoose.Schema<IUser>({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	avatar: {
		type: String,
	},
	date: {
		type: Date,
		default: new Date(),
	},
});

export const User: IUserModel = mongoose.model('user', UserSchema);
