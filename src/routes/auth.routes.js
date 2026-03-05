import { Router } from "express"
import { registerUser } from "../controller/auth.controller.js"
import { validtor } from "../middleware/validator.middleware.js"
import { userValidator } from "../validators/user.validator.js"

const router = Router()
router.route("/register").post(userValidator(), validtor, registerUser)

export default router
