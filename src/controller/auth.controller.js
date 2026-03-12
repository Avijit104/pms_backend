import jwt from "jsonwebtoken"
import crypto from "crypto"
import {
    mailSender,
    emailVarificationContent,
    resetPasswordContent,
} from "../util/mailContent.js"

// api handlers
import { ApiError } from "../util/ApiError.js"
import { ApiResponse } from "../util/ApiResponse.js"
import { requestHandler } from "../util/reqestHandler.js"

// models
import { user } from "../model/user.model.js"

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

    await mailSender({
        email: newUser.email,
        subject: "please validate your email address",
        mailgenContent: emailVarificationContent(
            newUser.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHasedToken}`,
        ),
    })

    newUser.emailVerificationToken = hashedToken
    newUser.emailVerificationExpiry = tokenExpiry
    await newUser.save({ validateBeforeSave: false })

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
                { user: createdUser, unhasedtoken: unHasedToken },
                "user registered successfully and verification email has been sent on your email",
            ),
        )
})

const loginUser = requestHandler(async (req, res) => {
    const { email, password } = req.body
    const loggedinUser = await user.findOne({ email })
    if (!loggedinUser) {
        throw new ApiError(400, "email is not registered")
    }
    const status = loggedinUser.passwordValidation(password)
    if (!status) {
        throw new ApiError(400, "Invalid credentials")
    }
    const { accessToken, refreshToken } = await addTokens(loggedinUser._id)

    const currUser = await user
        .findById(loggedinUser._id)
        .select(
            "-password -refreshToken -emailVerificationToken -avatar -forgotPasswordToken",
        )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: currUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                },
                "user loggedin successfully",
            ),
        )
})

const logoutUser = requestHandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: "" } },
        { new: true },
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"))
})

const getCurrentUser = requestHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "current user"))
})

const verifyEmail = requestHandler(async (req, res) => {
    const { emailVerificationToken } = req.params
    console.log(emailVerificationToken)
    if (!emailVerificationToken) {
        throw new ApiError(400, "email verification token is missing")
    }
    const hashedToken = crypto
        .createHash("sha256")
        .update(emailVerificationToken)
        .digest("hex")

    const currUser = await user.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    })
    if (!currUser) {
        throw new ApiError(400, "Invalid user")
    }

    currUser.isEmailVerified = true
    currUser.emailVerificationToken = undefined
    currUser.emailVerificationExpiry = undefined

    await currUser.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "email verified successfully"))
})

const reqestEmailVerification = requestHandler(async (req, res) => {
    const currUser = await user.findById(req?.user._id)
    if (!currUser) {
        throw new ApiError(404, "user not found")
    }
    const { unHasedToken, hashedToken, tokenExpiry } =
        currUser.generateTempTokens()

    await mailSender({
        email: currUser.email,
        subject: "please validate your email address",
        mailgenContent: emailVarificationContent(
            currUser.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHasedToken}`,
        ),
    })

    currUser.emailVerificationToken = hashedToken
    currUser.emailVerificationExpiry = tokenExpiry
    await currUser.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                hashedToken: hashedToken,
                unHasedToken: unHasedToken,
                tokenExpiry: tokenExpiry,
            },
            "email verification mail sent successfully",
        ),
    )
})

const refreshAccessToken = requestHandler(async (req, res) => {
    const incommingToken = req.cookies.refreshToken
    if (!incommingToken) {
        throw new ApiError(401, "unautherized user")
    }
    try {
        const decodedToken = jwt.verify(
            incommingToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        const currUser = await user.findById(decodedToken._id)
        if (!currUser) {
            throw new ApiError(401, "Invalid user")
        }
        if (currUser.refreshToken !== incommingToken) {
            throw new ApiError(401, "refresh token is expired")
        }
        const { accessToken, refreshToken } = await addTokens(currUser._id)

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    },
                    "access token updated successfully",
                ),
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

const forgotPassword = requestHandler(async (req, res) => {
    const { email } = req.body
    const currUser = await user.findOne({ email })

    if (!currUser) {
        throw new ApiError(404, "User not found")
    }

    const { unHasedToken, hashedToken, tokenExpiry } =
        currUser.generateTempTokens()

    await mailSender({
        email: currUser?.email,
        subject: "forgot password request",
        mailgenContent: resetPasswordContent(
            currUser.username,
            `${process.env.FORGOT_PASSOWRD_URL}/${unHasedToken}`,
        ),
    })

    currUser.forgotPasswordToken = hashedToken
    currUser.forgotPasswordExpiry = tokenExpiry
    await currUser.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { unHasedToken, hashedToken, tokenExpiry },
                "forgot password mail sent successfully",
            ),
        )
})

const resetPassword = requestHandler(async (req, res) => {
    const { password } = req.body
    const { incommingToken } = req.params
    if (!incommingToken) {
        throw new ApiError(400, "reset password token is missing")
    }
    const hashedToken = crypto
        .createHash("sha256")
        .update(incommingToken)
        .digest("hex")

    const currUser = await user.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    })
    if (!currUser) {
        throw new ApiError(489, "token has been expired")
    }

    currUser.password = password
    currUser.forgotPasswordToken = undefined
    currUser.forgotPasswordExpiry = undefined
    await currUser.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "your password has been changed successfully",
            ),
        )
})

const changePassword = requestHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const currUser = await user.findById(req.user?._id)
    const isValidated = currUser.passwordValidation(oldPassword)
    if (!isValidated) {
        throw new ApiError(400, "wrong password ")
    }

    currUser.password = newPassword
    await currUser.save({ validateBeforeSave: false })

    const updatedUser = await user
        .findById(currUser._id)
        .select(
            "-password -refreshToken -emailVerificationToken -avatar -forgotPasswordToken",
        )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updatedUser },
                "password changed successfully",
            ),
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    reqestEmailVerification,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    changePassword,
}
