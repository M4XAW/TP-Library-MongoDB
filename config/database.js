import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db, booksCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("library");
        booksCollection = db.collection("books");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export { connectDB, booksCollection }