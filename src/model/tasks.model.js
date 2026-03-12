import mongoose, { Schema } from "mongoose"
import { taskStatus, avaliableTaskStatus } from "../util/constants.js"

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        desc: {
            type: String,
            required: true,
            trim: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        attachments: {
            type: [
                {
                    url: String,
                    mimetype: String,
                    size: Number,
                },
            ],
            default: [],
        },
        status: {
            type: String,
            enum: avaliableTaskStatus,
            default: taskStatus.TODO,
        },
    },
    { timestamps: true },
)

export const tasks = mongoose.model("tasks", taskSchema)
