import mongoose, { Schema } from "mongoose"

const subTasksSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: "tasks",
            required: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    },
    { timestamps: true },
)

export const subTasks = mongoose.model("subtasks", subTasksSchema)
