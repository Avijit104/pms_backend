import { body } from "express-validator"

const userRgistrationValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("enter a valid email"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("username is required")
            .isLength({ min: 3 })
            .withMessage("username must be bigger than 3 characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password must be bigger than 8 characters"),
    ]
}

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please enter a valid Email")
            .notEmpty()
            .withMessage("Email is required"),

        body("password").trim().notEmpty().withMessage("Password is required"),
    ]
}
const changePasswordValidator = () => {
    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("old password is required"),
        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("new password is required")
            .isLength({ min: 8 })
            .withMessage("password must be bigger than 8 characters"),
    ]
}

const resetPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .isEmail()
            .withMessage("invalid email please enter a valid email")
            .notEmpty()
            .withMessage("email is required"),
    ]
}

const userForgotResetPassword = () => {
    return [
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password must be 8 characters long"),
    ]
}

export {
    userRgistrationValidator,
    userLoginValidator,
    changePasswordValidator,
    resetPasswordValidator,
    userForgotResetPassword,
}
