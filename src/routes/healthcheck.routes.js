import { Router } from "express"
import healthCheck from "../controller/healthCheck.controllers.js"

const router = Router()

router.route("/").get(healthCheck)

export default router
