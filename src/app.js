import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import healthchekRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"

const app = express()

//basic configuration----------------------------------------------------------------------------------------
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

//cookie configuration---------------------------------------------------------------------------------------------
app.use(cookieParser())

//cors configuration------------------------------------------------------------------------------------------------
app.use(
    cors({
        origin: process.env.ORIGIN?.split(",") || "http://localhost:3010",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
)

//routes configuration-----------------------------------------------------------------------------------------------
app.use("/api/v1/healthcheck", healthchekRouter)
app.use("/api/v1/auth", authRouter)

//running server-----------------------------------------------------------------------------------------------------
app.get("/", (req, res) => {
    res.send("wellcome to managepro")
})

export default app
