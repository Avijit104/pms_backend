import { requestHandler } from "../util/reqestHandler.js"
import { ApiError } from "../util/ApiError.js"
import { user } from "../model/user.model.js"
import { project } from "../model/project.model.js"
import { members } from "../model/members.model.js"
import mongoose from "mongoose"

export const validateProjectPermissions = (roles = []) => {
    // This middleware always runs after the verifyJwt middleware
    requestHandler(async (req, res, next) => {
        const { projectId } = req.params

        if (!projectId) {
            throw new ApiError(400, "project id is missing")
        }

        const projectMember = await members.findOne({
            project: new mongoose.Types.ObjectId(projectId),
            users: new mongoose.Types.ObjectId(req.user._id),
        })
        if (!projectMember) {
            throw new ApiError(404, "member not found")
        }
        const givenRole = projectMember?.role
        req.user.role = givenRole
        if (!roles.includes(givenRole)) {
            throw new ApiError(
                408,
                "user does not have permission to perform this action",
            )
        }
        next()
    })
}
