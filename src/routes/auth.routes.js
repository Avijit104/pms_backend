import { Router } from "express"
import {
    loginUser,
    logoutUser,
    registerUser,
    getCurrentUser,
} from "../controller/auth.controller.js"
import { validator } from "../middleware/validator.middleware.js"
import { jwtVerifier } from "../middleware/auth.middleware.js"
import {
    userRgistrationValidator,
    userLoginValidator,
} from "../validators/user.validator.js"

const router = Router()
router
    .route("/register")
    .post(userRgistrationValidator(), validator, registerUser)

router.route("/login").post(userLoginValidator(), validator, loginUser)

router.route("/logout").post(jwtVerifier, logoutUser)

router.route("/current-user").get(jwtVerifier, getCurrentUser)

export default router
