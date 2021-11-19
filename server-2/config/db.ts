import mongoose from "mongoose";
import config from 'config';

export const connectDB = async () => {
	const db = config.get<string>('mongoURI');
	try {
		await mongoose.connect(db);
		console.log('MongoDB Connected !!!');
	} catch (err) {
		console.error(err);
		//Exit process with failure
		process.exit(1);
	}
};
