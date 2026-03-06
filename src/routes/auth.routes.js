import { Router } from "express"
import { loginUser, registerUser } from "../controller/auth.controller.js"
import { validator } from "../middleware/validator.middleware.js"
import {
    userRgistrationValidator,
    userLoginValidator,
} from "../validators/user.validator.js"

const router = Router()
router
    .route("/register")
    .post(userRgistrationValidator(), validator, registerUser)

router.route("/login").post(userLoginValidator(), validator, loginUser)

export default router
