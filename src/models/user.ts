// define exactly how a user is going to look inside of our mongodb

import mongoose from 'mongoose'
const { Schema } = mongoose;

const userSchema = new Schema({
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		min: 12, 
	},
	stripeCustomerId: {
		type: String,
		required: true,
	}
})

export default mongoose.model("User", userSchema)