import { user } from "../model/user.model.js"
import { ApiResponse } from "../util/ApiResponse.js"
import { requestHandler } from "../util/reqestHandler.js"
import { ApiError } from "../util/ApiError.js"
import { mailSender, emailVarificationContent } from "../util/mailContent.js"

const addTokens = async (userId) => {
    try {
        const currUser = await user.findById(userId)
        const refreshToken = currUser.generateRefreshToken()
        const accessToken = currUser.generateAccessToken()
        currUser.refreshToken = refreshToken
        await currUser.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            "something went wrong during the token generations",
        )
    }
}

const registerUser = requestHandler(async (req, res) => {
    const { email, username, password, role } = req.body

    const existingUser = await user.findOne({
        $or: [{ email }],
    })

    if (existingUser) {
        throw new ApiError(409, "user already exists", [])
    }
    const newUser = await user.create({
        username,
        email,
        password,
        isEmailVerified: false,
    })

    const { unHasedToken, hashedToken, tokenExpiry } =
        newUser.generateTempTokens()

    newUser.emailVerificationToken = hashedToken
    newUser.emailVerificationExpiry = tokenExpiry
    await newUser.save({ validateBeforeSave: false })

    await mailSender({
        email: newUser.email,
        subject: "please validate your email address",
        mailgenContent: emailVarificationContent(
            newUser.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHasedToken}`,
        ),
    })

    const createdUser = await user
        .findById(newUser._id)
        .select(
            "-password -refreshToken -emailVerificationToken -avatar -forgotPasswordToken",
        )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong in registerinng user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "user registered successfully and verification email has been sent on your email",
            ),
        )
})

export { registerUser, addTokens }
