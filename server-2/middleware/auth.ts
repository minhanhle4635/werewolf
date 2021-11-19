import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import * as config from 'config';
import { NextFunction, Request, Response } from 'express'
import { IUserDocument } from "../interface/User.interface";

export const auth = function (req: Request, res: Response, next: NextFunction) {
	// Get token from header
	const token = req.header('x-auth-token');
	// Check if no token
	if (!token) {
		return res.status(401).json({msg: 'No token, authorization denied'});
	}
	//Verify token
	try {
		const decoded = jwt.verify(token, config.get<string>('jwtSecret')) as JwtPayload;
		req.user = decoded.user as IUserDocument;
		return next();
	} catch (e) {
		return res.status(401).json({msg: 'Token is not valid'});
	}
};
