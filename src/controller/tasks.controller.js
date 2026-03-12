// api handlers
import { ApiError } from "../util/ApiError.js"
import { ApiResponse } from "../util/ApiResponse.js"
import { requestHandler } from "../util/reqestHandler.js"

// models
import { tasks } from "../model/tasks.model.js"
import { subTasks } from "../model/subtasks.model.js"
import { project } from "../model/project.model.js"
import { user } from "../model/user.model.js"

const getTask = requestHandler(async (req, res) => {})

const createTask = requestHandler(async (req, res) => {})

const getTaskById = requestHandler(async (req, res) => {})

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
