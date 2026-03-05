import { validationResult } from "express-validator"
import { ApiError } from "../util/ApiError.js"

const validator = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractErrors = []
    errors.array().map((err) => extractErrors.push({ [err.path]: err.msg }))
    throw new ApiError(422, "invalid data", extractErrors)
}

export { validator }
