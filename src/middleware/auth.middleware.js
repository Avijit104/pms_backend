import jwt from "jsonwebtoken"
import { ApiError } from "../util/ApiError.js"
import { user } from "../model/user.model.js"
import { requestHandler } from "../util/reqestHandler.js"

export const jwtVerifier = requestHandler(async (req, res, next) => {
    const token =
        req?.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(401, "Unautherize request")
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const reqUser = await user
            .findById(decodedToken?._id)
            .select(
                "-password -refreshToken -emailVerificationToken -avatar -forgotPasswordToken",
            )
        if (!reqUser) {
            throw new ApiError(401, "Unautherized user")
        }
        req.user = reqUser
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token")
    }
})
