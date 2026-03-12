import { Router } from "express"
import { roles, availableRoles } from "../util/constants.js"
// middlewares
import { jwtVerifier } from "../middleware/auth.middleware.js"
import { validator } from "../middleware/validator.middleware.js"
import { validateProjectPermissions } from "../middleware/role.middleware.js"

// validators
import {
    createProjectValidator,
    updateProjectValidator,
    addProjectMemberValidator,
    changeProjectMemberValidator,
} from "../validators/project.validator.js"

// controllers
import {
    createProject,
    getProject,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    getProjectMembers,
    updateMemberRole,
    removeProjectMember,
} from "../controller/projects.controller.js"

const router = Router()
router.use(jwtVerifier)

router
    .route("/")
    .get(getProject)
    .post(
        validateProjectPermissions([roles.ADMIN]),
        createProjectValidator(),
        validator,
        createProject,
    )

router
    .route("/:projectId")
    .get(validateProjectPermissions(availableRoles), getProjectById)
    .put(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        updateProjectValidator(),
        validator,
        updateProject,
    )
    .delete(validateProjectPermissions([roles.ADMIN]), deleteProject)

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        addProjectMemberValidator(),
        validator,
        addProjectMember,
    )

router
    .route("/:projectId/members/:userId")
    .put(
        validateProjectPermissions([roles.ADMIN]),
        changeProjectMemberValidator(),
        validator,
        updateMemberRole,
    )
    .delete(
        validateProjectPermissions([roles.ADMIN, roles.PROJECT_ADMIN]),
        changeProjectMemberValidator(),
        validator,
        removeProjectMember,
    )
export default router
