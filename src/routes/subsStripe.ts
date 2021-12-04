import express from 'express'
import User from '../models/user';
import Article from '../models/article';
import { checkAuth } from '../middleware/checkAuth';
import { stripe } from '../utils/stripe'

const router = express.Router();

// GET All the products and their prices
router.get("/prices", checkAuth, async (req, res) => {
	// res.send("Heyo, these are the prices");	
	const prices = await stripe.prices.list({
		apiKey: process.env.SECRET_STRIPE_API_KEY
	})

	return res.json(prices)
})

// CREATE a session checkout
router.post("/session", checkAuth, async(req, res) => {
	const user = await User.findOne({email: req.user})

	const session = await stripe.checkout.sessions.create({
		mode: "subscription",
		payment_method_types: ["card"],
		line_items: [
			{
				price: req.body.priceId,
				quantity: 1,
				// currency: 'sgd',
				// amount: 
			}
		],
		success_url: "http://localhost:3000/articles",
		cancel_url: "http://localhost:3000/article-plans",
		customer: user.stripeCustomerId
	}, {
		apiKey: process.env.SECRET_STRIPE_API_KEY
	})

	return res.json(session)

}) 

export default router