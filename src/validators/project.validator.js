import { body } from "express-validator"
import { availableRoles } from "../util/constants.js"

const createProjectValidator = () => {
    return [
        body("name").trim().notEmpty().withMessage("name is required"),
        body("desc")
            .trim()
            .notEmpty()
            .withMessage("description is required")
            .isLength({ max: 256 })
            .withMessage("description must be within 256 characters"),
    ]
}
const updateProjectValidator = () => {
    return [
        body("name").trim().optional(),
        body("desc")
            .trim()
            .optional()
            .isLength({ max: 256 })
            .withMessage("description must be within 256 characters"),
    ]
}

const addProjectMemberValidator = () => {
    return [
        body("email")
            .trim()
            .isEmail()
            .withMessage("enter a valid email id")
            .notEmpty()
            .withMessage("email is required"),
        body("role")
            .trim()
            .notEmpty()
            .withMessage("role is required")
            .isIn(availableRoles)
            .withMessage("role is invalid"),
    ]
}

const changeProjectMemberValidator = () => {
    return [
        body("projectId").trim().notEmpty().withMessage("projectId is missing"),
        body("userId").trim().notEmpty().withMessage("user id is missing"),
    ]
}

export {
    createProjectValidator,
    updateProjectValidator,
    addProjectMemberValidator,
    changeProjectMemberValidator,
}
