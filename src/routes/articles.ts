import express from 'express'
import User from '../models/user';
import Article from '../models/article';
import { checkAuth } from '../middleware/checkAuth';
import { stripe } from '../utils/stripe'

const router = express.Router();

router.get('/', checkAuth, async(req, res) => {
	const user = await User.findOne({email: req.user})

	const subscriptions = await stripe.subscriptions.list(
		{
			customer: user.stripeCustomerId,
			status: "all",
			expand: ["data.default_payment_method"]
		},
		{
			apiKey: process.env.SECRET_STRIPE_API_KEY
		}
	)

	if(!subscriptions.data.length) {
		// return no articles
		return res.json([])
	}

	//@ts-ignore
	const plan = subscriptions.data[0].plan.nickname

	// BASIC
	if(plan === "Basic") {
		const articles = await Article.find({access: 'Basic'})
		return res.json(articles)
	} else if (plan === "Standard") {
		const articles = await Article.find({
			access: {$in: ["Basic", "Standard"]}
		})
		return res.json(articles)
	} else {
		const articles = await Article.find({})
		return res.json(articles); // return all articles that is in the premium plan
	}
	
	// res.json(response)
	res.json(plan)
	
})

export default router