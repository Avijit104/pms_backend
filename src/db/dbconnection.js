import mongoose from "mongoose"

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("db connection successful")
    } catch (error) {
        console.error("an error occured in db connection", error)
        process.exit(1)
    }
}

export default dbConnect
