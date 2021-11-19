import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import config from "config";
import * as gravatar from 'gravatar';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from "../../models/User";
import { Profile } from "../../models/Profile";

const router = express.Router();


// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include valid email').isEmail(),
		check('password', 'Please enter 5 or more character for password').isLength(
			{min: 5}
		),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}

		const {name, email, password} = req.body;

		try {
			//See if user exists
			let user = await User.findOne({email});
			if (user) {
				return res
					.status(400)
					.json({errors: [{msg: 'User already exist'}]});
			}
			//Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			});

			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// Encrypt password
			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);

			await user.save();
			// Return jsonwebtoken
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{
					expiresIn: 360000,
				},
				(e, token) => {
					if (e) throw e;
					res.json({token});
				}
			);

			//Create Profile
			const profile = new Profile({
				fullname: name,
				email: email,
			});

			await profile.save();
		} catch (e: any) {
			console.error(e.message);
			res.status(500).send('Server error');
		}
	}
);

export = router;
