import { Document, Model } from "mongoose";
import { IUserDocument } from "./User.interface";

export interface IProfileDocument extends Document {
	user: IUserDocument | string,
	fullname: string,
	DoB: Date,
	bio: string,
	email: string
}

export interface IProfile extends IProfileDocument {
	// writes your custom methods here.
}

export interface IProfileModel extends Model<IProfile> {
	// writes your custom static fn here.
}
