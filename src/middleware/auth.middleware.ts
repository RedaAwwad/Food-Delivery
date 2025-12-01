import { RequestHandler } from "express"
import { CustomError } from "../utils/errors/custom-error"
import { StatusCodes } from "http-status-codes"

export const isAuthorized = (roles:string[]):RequestHandler => {
    return (req , res , next) => {       // from Token 
        const checkedRole = 'restaurant' // TODO req.user?.role
        if(!checkedRole || !roles.includes(checkedRole)) {
            throw new CustomError({
                message:'The Role is Unauthorized' , 
                statusCode:StatusCodes.FORBIDDEN
            })
        }       
        next()
    }
}

// export const isAuthenticated = 