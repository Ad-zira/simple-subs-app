import express from "express";
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/auth'
import subsRoutes from './routes/subsStripe'
import articlesRoutes from './routes/articles'

dotenv.config();

mongoose
	.connect(process.env.MONGO_URI as string)
	.then(() => {
		console.log("Connected to mongodb")
		
		const app = express();
		app.use(express.json());
		app.use(cors({
			origin: '*',
			methods: "GET,HEAD,PUT,POST,DELETE",
			optionsSuccessStatus: 204
		}))
		// app.use(express.urlencoded({ extended: true }))
		app.use("/auth", authRoutes)
		app.use("/subs", subsRoutes)
		app.use("/articles", articlesRoutes)

		const port = process.env.PORT || 8080;

		app.listen(port, () => {
			console.log(`Listening to the server on port ${port}`)
		})
	})
	.catch(err => {
		console.log(err)
		throw new Error(err)
	})

// app.get('/api', (req, res) => {
// 	const pronounce = 'hello world, we are '
// 	const requestedId = 'using jwt'
	
// 	res.send(pronounce + requestedId)
// })