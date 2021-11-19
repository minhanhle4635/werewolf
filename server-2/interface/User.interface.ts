import { Document, Model } from "mongoose";

export interface IUserDocument extends Document {
	name: string;
	email: string;
	password?: string;
	avatar: string;
	date: Date
}

export interface IUser extends IUserDocument {
	// writes your custom methods here.
}

export interface IUserModel extends Model<IUser> {
	// writes your custom static fn here.
}
