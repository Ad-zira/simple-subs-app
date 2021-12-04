import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import User from '../models/user';
import jwt from 'jsonwebtoken'
import { checkAuth } from '../middleware/checkAuth';
import {stripe} from '../utils/stripe'

const router = express.Router();

router.post(
	'/signup', 
	body('email').isEmail().withMessage('The email is invalid'), 
	body('password').isLength({ min: 12 }).withMessage('The password is too short'), 
	async(req, res) => {
		const validationErrors = validationResult(req) // return an array of errors

		if (!validationErrors.isEmpty()) {
			const errors = validationErrors.array().map(err => {
				return {
					msg: err.msg
				}
			})
			return res.json({errors, data: null})
		}
		
		const {email, password} = req.body;

		const user = await User.findOne({email}); 
		// to make sure that there is already registered email
		if(user) {
			return res.json({
				error: [
					{
						msg: "Email already in use",

					}
				],
				data: null
			})
		}

		const newStripeCustomer = await stripe.customers.create({
			email
		}, {
			apiKey: process.env.SECRET_STRIPE_API_KEY
		})

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = await User.create({
			email,
			password: hashedPassword,
			stripeCustomerId: newStripeCustomer.id
		});
		
		const token = jwt.sign(
			{ email: newUser.email },
			process.env.JWT_SECRET as string,
			{ expiresIn: 86400 }
		)
		
		res.json({
			errors: [],
			data: {
				token,
				user: {
					id: newUser._id,
					email: newUser.email,
					stripeCustomerId: newStripeCustomer.id
				}
			}
		})
	}
)

router.post('/login', async(req, res) => {
	const {email, password} = req.body;

	const user = await User.findOne({email})

	if(!user) {
		return res.json({
			errors: [
				{msg: "No users found with that email!"}
			],
			data: null
		})
	}

	const isMatch = await bcrypt.compare(password, user.password)
	let remainingPasswords = 3;

	if(!isMatch) {
		return res.json({
			errors: [
				{
					msg: `Passwords do not match! ${remainingPasswords} more wrong passwords, you'll be blessed!`
				}
			],
			data: null
		})
	}

	const token = jwt.sign(
		{ email: user.email },
		process.env.JWT_SECRET as string,
		{ expiresIn: 86400 }
	) 

	return res.json({
		errors: [],
		data: {
			token, 
			user: {
				id: user._id,
				email: user.email
			}
		}
	})
})

router.get('/me', checkAuth, async (req, res) => {
	console.log("hello this is route /me")
	// res.send("Me Route" + '\n\n\t This user is of email: ' + req.user)
	const user = await User.findOne({ email: req.user })

	// To handle data (state) globally on the client
	return res.json({
		errors: [],
		data: {
			user: {
				id: user._id,
				email: user.email,
				stripeCustomerId: user.stripeCustomerId
			}
		}
	})
})

export default router;