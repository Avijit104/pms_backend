import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

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
        username: {
            type: String,
            required: true,
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

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return
    this.password = bcrypt.hash(this.password, 10)
})

userSchema.methods.passwordValidation = async function (password) {
    return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            // payload
            _id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            // payload
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    )
}

userSchema.methods.generateTempTokens = function () {
    const unHasedToken = crypto.randomBytes(20).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHasedToken)
        .digest("hex")
    const tokenExpiry = Date.now() + 20 * 60 * 100
    return { unHasedToken, hashedToken, tokenExpiry }
}

export const user = mongoose.model("users", userSchema)
