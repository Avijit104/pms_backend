import { Router } from "express"

import { validator } from "../middleware/validator.middleware.js"
import { jwtVerifier } from "../middleware/auth.middleware.js"
import { validateProjectPermissions } from "../middleware/role.middleware.js"

import {
    getTask,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
} from "../controller/tasks.controller.js"

import {
    taskValidator,
    subTaskValidator,
} from "../validators/tasks.validators.js"
import { availableRoles, roles } from "../util/constants.js"

const router = Router()
router.use(jwtVerifier)

router
    .route("/:projectId")
    .post(
        validateProjectPermissions([roles.ADMIN]),
        taskValidator(),
        validator,
        createTask,
    )
    .get(validateProjectPermissions(availableRoles), getTask)

router
    .route("/:projectId/t/:taskId")
    .get(validateProjectPermissions(availableRoles), getTaskById)
    .put(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        taskValidator(),
        validator,
        updateTask,
    )
    .delete(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        deleteTask,
    )

router
    .route("/:projectId/t/:taskId/subtasks")
    .post(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        subTaskValidator(),
        validator,
        createSubTask,
    )
router
    .route("/:projectId/st/:subTaskId")
    .put(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        subTaskValidator(),
        validator,
        updateSubTask,
    )
    .delete(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        deleteSubTask,
    )

export default router
