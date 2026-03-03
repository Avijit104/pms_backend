import dotEnv from "dotenv"
import app from "./app.js"
import dbConnect from "./db/dbconnection.js"
dotEnv.config({
    path: "./.env",
})
const port = process.env.PORT || 3000

dbConnect()
    .then(() => {
        app.listen(port, () => {
            console.log(`url : http://localhost:${port}`)
        })
    })
    .catch((err) => {
        console.error("app error form mongo", err)
        process.exit(1)
    })
