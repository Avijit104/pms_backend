import { ApiResponse } from "../util/ApiResponse.js"
import { requestHandler } from "../util/reqestHandler.js"
// const healthCheck = (req, res) => {
//     try {
//         res.status(200).json(
//             new ApiResponse(200, { message: "server is running" }),
//         )
//     } catch (error) {}
// }

const healthCheck = requestHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, { message: "server is running fine" }),
    )
})

export default healthCheck
