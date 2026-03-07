import { Router } from "express"
import {
    loginUser,
    logoutUser,
    registerUser,
    getCurrentUser,
    verifyEmail,
    refreshAccessToken,
    resetPassword,
    forgotPassword,
    changePassword,
    reqestEmailVerification,
} from "../controller/auth.controller.js"
import { validator } from "../middleware/validator.middleware.js"
import { jwtVerifier } from "../middleware/auth.middleware.js"
import {
    userRgistrationValidator,
    userLoginValidator,
    resetPasswordValidator,
    userForgotResetPassword,
    changePasswordValidator,
} from "../validators/user.validator.js"

const router = Router()

// unsecure routes
router
    .route("/register")
    .post(userRgistrationValidator(), validator, registerUser)

router.route("/login").post(userLoginValidator(), validator, loginUser)

router.route("/verify-email/:emailVerificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router
    .route("/forgot-password")
    .post(resetPasswordValidator(), validator, forgotPassword)

router
    .route("/reset-password/:incommingToken")
    .post(userForgotResetPassword(), validator, resetPassword)

//sercure routes
router.route("/logout").post(jwtVerifier, logoutUser)

router.route("/current-user").get(jwtVerifier, getCurrentUser)

router
    .route("/change-password")
    .post(changePasswordValidator(), validator, jwtVerifier, changePassword)

router.route("/resend-email").get(jwtVerifier, reqestEmailVerification)

export default router
