import dotEnv from "dotenv"
import app from "./app.js"
dotEnv.config({
    path: "./.env",
})
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`url : http://localhost:${port}`)
})
