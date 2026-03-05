import { body } from "express-validator"

const userValidator = () => {
    return [
        body("email")
            .trim()
            .isEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("enter a valid email"),
        body("username")
            .trim()
            .isEmpty()
            .withMessage("username is required")
            .isLength({ min: 3 })
            .withMessage("username must be bigger than 3 characters"),
        body("password")
            .trim()
            .isEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("password must be bigger than 8 characters"),
    ]
}

export { userValidator }
