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

const updateTask = requestHandler(async (req, res) => {
    const { title, desc, assignedTo, status } = req.body
    const { taskId } = req.params
    if (!taskId) {
        throw new ApiError(409, "task id is missing")
    }
    const currTask = await tasks.findByIdAndUpdate(
        taskId,
        {
            $set: {
                title: title,
                desc: desc,
                assignedTo: new mongoose.Types.ObjectId(assignedTo),
                status: status,
            },
        },
        {
            new: true,
        },
    )
    if (!currTask) {
        throw new ApiError(404, "task not found")
    }
    currTask.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, { currTask }, "task updation is successful"))
})

const deleteTask = requestHandler(async (req, res) => {
    const { taskId } = req.params
    if (!taskId) {
        throw new ApiError(409, "task id is missing")
    }

    const deletedTask = await tasks.findByIdAndDelete(taskId)

    const deletedSubTask = await subTasks.deleteMany({ task: { taskId } })

    if (!deletedTask) {
        throw new ApiError(400, "task deletion failed")
    }

    if (!deletedSubTask) {
        throw new ApiError(400, "subtasks deletion failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { tasks: deletedTask, subTasks: deletedSubTask },
                "task deletion successful",
            ),
        )
})

const createSubTask = requestHandler(async (req, res) => {
    const { title, isCompleted, assignedBy } = req.body
    const { taskId } = req.params

    if (!taskId) {
        throw new ApiError(400, "taskid is missing")
    }
    const newSubTask = await subTasks.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        isCompleted,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    })

    if (!newSubTask) {
        throw new ApiError(400, "sub task creation failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { newSubTask },
                "sub task created successfully",
            ),
        )
})

const updateSubTask = requestHandler(async (req, res) => {
    const { title, isCompleted } = req.body
    const { subTaskId } = req.params

    if (!subTaskId) {
        throw new ApiError(400, "subtask Id is missing")
    }

    const currSubTask = await subTasks.findByIdAndUpdate(
        subTaskId,
        {
            $set: {
                title: title,
                isCompleted: isCompleted,
            },
        },
        {
            new: true,
        },
    )
    if (!currSubTask) {
        throw new ApiError(404, "subtasks not found")
    }

    currSubTask.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { currSubTask },
                "sub task updated successfully",
            ),
        )
})

const deleteSubTask = requestHandler(async (req, res) => {
    const { subTaskId } = req.params
    if (!subTaskId) {
        throw new ApiError(400, "sub task id is missing")
    }
    const deletedSubTask = await subTasks.findByIdAndDelete(subTaskId)
    if (!deleteSubTask) {
        throw new ApiError(404, "subtask not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { deletedSubTask },
                "sub task deleted successfully",
            ),
        )
})

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
