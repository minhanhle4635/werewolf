import { Schema } from "mongoose";
import { IProfileDocument, IProfileModel } from "../interface/Profile.interface";

const mongoose = require('mongoose');

const ProfileSchema: Schema<IProfileDocument> = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
	},
	fullname: {
		type: String,
		required: true,
	},
	DoB: {
		type: Date,
		default: Date.now,
	},
	bio: {
		type: String,
	},
	email: {
		type: String,
		required: true,
	},
});

export const Profile: IProfileModel = mongoose.model('profile', ProfileSchema);
