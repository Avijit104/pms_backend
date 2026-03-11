import { project } from "../model/project.model.js"
import { members } from "../model/members.model.js"
import { user } from "../model/user.model.js"
import { ApiResponse } from "../util/ApiResponse.js"
import { requestHandler } from "../util/reqestHandler.js"
import { ApiError } from "../util/ApiError.js"
import mongoose from "mongoose"
import { roles } from "../util/constants.js"

const createProject = requestHandler(async (req, res) => {
    const { name, desc } = req.body

    const newProject = await project.create({
        name,
        desc,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    })

    const newProjectMember = await members.create({
        users: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(newProject._id),
        role: roles.ADMIN,
    })

    const createdProject = await project.findById(newProject._id)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { createdProject, newProjectMember },
                "project creation successful",
            ),
        )
})

const getProject = requestHandler(async (req, res) => {
    const userProjects = await members.aggregate([
        {
            $match: {
                users: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "allProjects",
                pipeline: [
                    {
                        $lookup: {
                            from: "members",
                            localField: "_id",
                            foreignField: "project",
                            as: "projectMembers",
                        },
                    },
                    {
                        $addFields: {
                            members: {
                                $size: "$projectMembers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$allProjectsk",
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    desc: 1,
                    members: 1,
                    createdBy: 1,
                },
                role: 1,
                _id: 0,
            },
        },
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { userProjects },
                "all projects fetched successfully",
            ),
        )
})

const getProjectById = requestHandler(async (req, res) => {
    const { projectId } = req.params
    const currProject = await project.findById(projectId)
    if (!currProject) {
        throw new ApiError(404, "project not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { currProject },
                "project fethed successfilly",
            ),
        )
})

const updateProject = requestHandler(async (req, res) => {
    const { name, desc } = req.body
    const { projectId } = req.params

    const updatedProject = await project.findByIdAndUpdate(
        projectId,
        {
            $set: {
                name: name,
                desc: desc,
            },
        },
        {
            new: true,
        },
    )

    if (!updatedProject) {
        throw new ApiError(404, "project not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { updatedProject },
                "project updation successful",
            ),
        )
})

const deleteProject = requestHandler(async (req, res) => {
    const { projectId } = req.params
    const deletedProject = await project.findByIdAndDelete(projectId)
    if (!deletedProject) {
        throw new ApiError(404, "project not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "project deleted successfully"))
})

const addProjectMember = requestHandler(async (req, res) => {
    const { email, role } = req.body
    const { projectId } = req.params

    const fetchedUser = await user.findOne({ email })

    if (!fetchedUser) {
        throw new ApiError(404, "user not found")
    }

    const member = await members.findOneAndUpdate(
        {
            users: new mongoose.Types.ObjectId(fetchedUser._id),
            project: new mongoose.Types.ObjectId(projectId),
        },
        {
            users: new mongoose.Types.ObjectId(fetchedUser._id),
            project: new mongoose.Types.ObjectId(projectId),
            role: role,
        },
        {
            new: true,
            upsert: true,
        },
    )

    return res.status(200).json(200, { member }, "member added successfully")
})

const getProjectMembers = requestHandler(async (req, res) => {
    const { projectId } = req.params
    const currProject = await project.findById(projectId)
    if (!currProject) {
        throw new ApiError(404, "projects not found")
    }
    const allMembers = await members.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "users",
                foreignField: "_id",
                as: "members",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                members: {
                    $arrayElementAt: ["$members", 0],
                },
            },
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                _id: 0,
            },
        },
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { allMembers },
                "all members of the project retrived successfully",
            ),
        )
})

const removeProjectMember = requestHandler(async (req, res) => {
    const { projectId, userId } = req.body

    const member = await members.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        users: new mongoose.Types.ObjectId(userId),
    })

    if (!member) {
        throw new ApiError(404, "member not found")
    }

    const deletedMember = await members.findByIdAndDelete(member._id)
    if (!deletedMember) {
        throw new ApiError(400, "member deletion failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedMember },
                "project member deleted successfully",
            ),
        )
})

const updateMemberRole = requestHandler(async (req, res) => {
    const { userId, projectId } = req.params
    const { newRole } = req.body
    if (!roles.includes(newRole)) {
        throw new ApiError(200, "invalid role")
    }
    let member = await members.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        users: new mongoose.Types.ObjectId(userId),
    })

    if (!member) {
        throw new ApiError(404, "project member not found")
    }

    member = await member.findOneAndUpdate(
        member._id,
        {
            role: newRole,
        },
        {
            new: true,
        },
    )
    if (!member) {
        throw new ApiError(409, "role updation failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, { member }, "member role updation successful"),
        )
})

export {
    createProject,
    getProject,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    getProjectMembers,
    removeProjectMember,
    updateMemberRole,
}
