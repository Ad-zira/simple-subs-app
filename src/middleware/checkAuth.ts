import { Request, Response, NextFunction } from 'express'
import JWT from 'jsonwebtoken'

export const checkAuth = async(
	req: Request, 
	res: Response, 
	next: NextFunction
) => {
	let token = req.header('authorization')

	if (!token) {
		return res.status(403).json({
			errors: [
				{
					msg: "unauthorized",
				}
			]
		})
	}

	token = token.split(' ')[1]; 
	// console.log(token)

	try{
		const user = (await JWT.verify(
			token,
			process.env.JWT_SECRET as string
		)) as {email: string} 
		
		req.user = user.email; // The most challenging concept in React+TS
		next();
	} catch(error){
		return res.status(403).json({
			errors: [
				{
					msg: "unauthorized"
				}
			]
		})
	}
}