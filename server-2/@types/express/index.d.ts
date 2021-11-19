// dirty trick to pass the typescript check.
import { IUserDocument } from "../../interface/User.interface";

export {};

declare global {
	namespace Express {
		interface Request {
			user: IUserDocument;
		}
	}
}
