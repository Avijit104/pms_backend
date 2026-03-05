import express from "express"
import cors from "cors"
import healthchekRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"

const app = express()

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

app.use(
    cors({
        origin: process.env.ORIGIN?.split(",") || "http://localhost:3010",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
)
app.use("/api/v1/healthcheck", healthchekRouter)
app.use("/api/v1/auth", authRouter)

app.get("/", (req, res) => {
    res.send("wellcome to managepro")
})

export default app
