// api handlers
import { ApiError } from "../util/ApiError.js"
import { ApiResponse } from "../util/ApiResponse.js"
import { requestHandler } from "../util/reqestHandler.js"

// models
import { tasks } from "../model/tasks.model.js"
import { subTasks } from "../model/subtasks.model.js"
import { project } from "../model/project.model.js"
import { user } from "../model/user.model.js"
import mongoose from "mongoose"

const createTask = requestHandler(async (req, res) => {
    const { title, desc, assignedTo, status } = req.body
    const { projectId } = req.params

    const currProject = await project.findById(projectId)

    if (!currProject) {
        throw new ApiError(404, "project not found")
    }

    const files = req.files || []

    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size,
        }
    })

    const newTask = await tasks.create({
        title,
        desc,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo
            ? new mongoose.Types.ObjectId(assignedTo)
            : undefined,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments,
        status,
    })

    return res
        .status(200)
        .json(new ApiResponse(200, { newTask }, "task added successfully"))
})

const getTask = requestHandler(async (req, res) => {
    const { projectId } = req.params
    const currProject = await project.findById(projectId)
    if (!currProject) {
        throw new ApiError(404, "porject not found")
    }

    const allTasks = await tasks
        .find({
            project: new mongoose.Types.ObjectId(projectId),
        })
        .populate("assignedTo", "email username")

    return res
        .status(200)
        .json(new ApiResponse(200, { allTasks }, "all tasks are fetched"))
})

const getTaskById = requestHandler(async (req, res) => {
    const { taskId } = req.params
    const currTask = await tasks.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId),
            },
        },
        {
            $lookup: {
                form: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "userDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            email: 1,
                            username: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                userDetails: {
                    $arrayElemAt: ["$userDetails", 0],
                },
            },
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "tasks",
                as: "subTaskDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 0,
                                        email: 1,
                                        username: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0],
                            },
                        },
                    },
                ],
            },
        },
    ])
    if (!currTask) {
        throw new ApiError(404, "task not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { currTask }, "task fetch is successfull"))
})

const updateTask = requestHandler(async (req, res) => {})

const deleteTask = requestHandler(async (req, res) => {})

const createSubTask = requestHandler(async (req, res) => {})

const updateSubTask = requestHandler(async (req, res) => {})

const deleteSubTask = requestHandler(async (req, res) => {})

export {
    getTask,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
}
