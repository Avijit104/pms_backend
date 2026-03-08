import mongoose, { Schema } from "mongoose"
import { roles, availableRoles } from "../util/constants.js"

const membersSchema = new Schema(
    {
        users: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },
        role: {
            type: String,
            enum: availableRoles,
            default: roles.MEMBER,
        },
    },
    { timestamps: true },
)

export const members = mongoose.model("members", membersSchema)
