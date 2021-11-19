import express, { Request, Response } from "express";
import { auth } from "../../middleware/auth";
import { User } from "../../models/User";
import { check, validationResult } from "express-validator";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from "config";

const router = express.Router();

/**
 * @route   GET api/auth
 * @desc    Test route
 * @access  Public
 */
router.get('/', [auth], async (req: Request, res: Response) => {
	try {
		const user = await User.findById(req.user.id);
		return res.json(user);
	} catch (e: any) {
		console.error(e.message);
		return res.status(500).send('Server error');
	}
});


/**
 * @route   POST api/auth
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
	'/',
	[
		check('email', 'Please include valid email').isEmail(),
		check('password', 'Password is required').exists(),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}

		const {email, password} = req.body;

		try {
			//See if user exists
			let user = await User.findOne({email}).select(['+password']);
			if (!user) {
				return res
					.status(400)
					.json({errors: [{msg: 'Invalid Credentials'}]});
			}

			const isMatch = await bcrypt.compare(password, user.password!);
			if (!isMatch) {
				return res.status(400).json({errors: [{msg: 'Invalid password'}]});
			}

			// Return jsonwebtoken
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get<string>('jwtSecret'),
				{
					expiresIn: 360000,
				},
				(e, token) => {
					if (e) throw e;
					res.json({token});
				}
			);
		} catch (e: any) {
			console.error(e.message);
			res.status(500).send('Server error');
		}
	}
);

/**
 * Make this file as a router module.
 */
export = router;
