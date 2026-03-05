import { Router } from "express"
import { loginUser, registerUser } from "../controller/auth.controller.js"
import { validator } from "../middleware/validator.middleware.js"
import { userValidator } from "../validators/user.validator.js"

const router = Router()
router.route("/register").post(userValidator(), validator, registerUser)
router.route("/login").post(loginUser)

export default router
