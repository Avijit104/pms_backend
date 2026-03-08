import mongoose, { Schema } from "mongoose"

const projectSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        desc: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    },
    {
        timestamps: true,
    },
)

export const project = mongoose.model("projects", projectSchema)
