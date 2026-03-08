import mongoose, { Schema } from "mongoose"

const noteSchema = new Schema(
    {
        project: {
            type: Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true },
)

export const notes = mongoose.model("notes", noteSchema)
