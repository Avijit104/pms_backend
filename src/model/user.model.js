import mongoose, { Schema } from "mongoose"

const userSchema = new Schema(
    {
        avatar: {
            type: {
                url: String,
                loacal: String,
            },
            default: {
                url: ``,
                local: "",
            },
        },
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        forgotPasswordToken: {
            type: String,
        },
        emailVerificationToken: {
            type: String,
        },
        forgotPasswordExpiry: {
            type: Date,
        },
        emailVerificationExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
)

export const user = mongoose.model("users", userSchema)
