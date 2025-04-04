import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/database.js";

// Routes
import bookRoutes from "./routes/bookRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB().catch(console.error);

app.use("/api", bookRoutes);

const PORT = process.env.API_PORT || 3000;
const HOST = process.env.API_HOST || "localhost";

app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});