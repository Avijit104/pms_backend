import { body } from "express-validator"
import { avaliableTaskStatus } from "../util/constants.js"

const taskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("title field is required"),
        body("desc")
            .trim()
            .notEmpty()
            .withMessage("desc is required")
            .isLength({ max: 256 })
            .withMessage("description must be less than 256 characters"),
        body("assignedTo")
            .trim()
            .notEmpty()
            .withMessage("assigned to is required"),
        body("status")
            .trim()
            .optional()
            .isIn(avaliableTaskStatus)
            .withMessage("invalid task status"),
    ]
}

const subTaskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("title is required field"),
        body("isCompleted").optional(),
    ]
}

export { taskValidator, subTaskValidator }
