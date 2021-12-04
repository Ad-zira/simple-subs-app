import Stripe from 'stripe';

export const stripe = new Stripe(process.env.SECRET_STRIPE_API_KEY as string, {
	// specifically we have to supply it with the apiVersion
	apiVersion: '2020-08-27'
})
