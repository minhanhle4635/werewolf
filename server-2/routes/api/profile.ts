import express, { Request, Response } from "express";
import { auth } from "../../middleware/auth";
import { Profile } from "../../models/Profile";
import { validationResult } from "express-validator";
import { IProfileDocument } from "../../interface/Profile.interface";
import { User } from "../../models/User";

const router = express.Router();

/**
 * @route   GET api/profile/me
 * @desc    Get current users profile
 * @access  Private
 */
router.get('/me', [auth], async (req: Request, res: Response) => {
	try {
		const profile = await Profile.findOne({user: req.user.id}).populate(
			'user',
			['name', 'avatar']
		);

		if (!profile) {
			return res.status(400).json({msg: 'There is no profile for this user'});
		}
		return res.json(profile);
	} catch (e: any) {
		console.error(e.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @route   POST api/profile
 * @desc    Create or update user profile
 * @access  Private
 */
router.post('/', [auth], async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({errors: errors.array()});
	}

	const {fullname, email, bio} = req.body;

	const profileFields: Partial<IProfileDocument> = {};
	profileFields.user = req.user.id;
	if (bio) profileFields.bio = bio;
	if (fullname) profileFields.fullname = fullname;
	if (email) profileFields.email = email;

	try {
		let profile = await Profile.findOne({user: req.user.id});

		if (profile) {
			//Update
			profile = await Profile.findOneAndUpdate(
				{user: req.user.id},
				{$set: profileFields},
				{new: true}
			);

			return res.json(profile);
		}
	} catch (e: any) {
		console.error(e.message);
		return res.status(500).send('Server Error');
	}
});

/**
 * @route   GET api/profile
 * @desc    Get all Profile
 * @access  Public
 */
router.get('/', async (req: Request, res: Response) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (e: any) {
		console.error(e.message);
		res.status(500).send('Server Error');
	}
});

/**
 * @route   GET api/profile/user/:user_id
 * @desc    Get profile by user id
 * @access  Public
 */
router.get('/user/:user_id', async (req: Request, res: Response) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar']);
		if (!profile) {
			return res.status(400).json({msg: 'Profile not found'});
		}
		return res.json(profile);
	} catch (e: any) {
		console.error(e.message);
		if (e.kind == 'ObjectId') {
			return res.status(400).json({msg: 'Profile not found'});
		}
		return res.status(500).send('Server Error');
	}
});

// @route   DELETE api/profile
// @desc    Delete profile, user, posts
// @access  Private
router.delete('/', auth, async (req, res) => {
	try {
		//@todo - remove users posts

		// Remove profile
		await Profile.findOneAndRemove({user: req.user.id});
		//Remove user
		await User.findOneAndRemove({_id: req.user.id});
		res.json({msg: 'User deleted'});
	} catch (e: any) {
		console.error(e.message);
		res.status(500).send('Server Error');
	}
});

export = router;
