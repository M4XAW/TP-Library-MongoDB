import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB, booksCollection } from "./config/database.js";
import { ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB().catch(console.error);

app.get("/books", async (req, res) => {
    try {
        const books = await booksCollection.find({}).toArray();
        res.json(books);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des livres :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

app.post("/book", async (req, res) => {
    try {
        const { title, author, year, available, genres, rating, stock } = req.body;
        if (!title || !author) {
            return res.status(400).json({ error: "Le titre et l'auteur sont obligatoires" });
        }

        if (year && (isNaN(year) || year < 1800)) {
            return res.status(400).json({ error: "L'année doit être un nombre supérieur ou égal à 1800" });
        }

        if (rating && (isNaN(rating) || rating < 0 || rating > 5)) {
            return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5" });
        }
        
        if (genres && !Array.isArray(genres)) {
            return res.status(400).json({ error: "Les genres doivent être un tableau" });
        }

        const newBook = { title, author, year, available, genres, rating, stock };

        const result = await booksCollection.insertOne(newBook);
        res.status(201).json({ message: "Livre ajouté avec succès", bookId: result.insertedId });
    } catch (error) {
        console.error("Une erreur s'est produite lors de l'ajout du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

app.put("/book/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
        // Empêchez la mise à jour de l'ID du livre
        const { _id, ...updateFields } = req.body;

        const result = await booksCollection.updateOne({ bookId }, { $set: updateFields });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.json({ message: "Livre mis à jour avec succès" });
    } catch (error) {
        console.error("Une erreur s'est produite lors de la mise à jour du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

app.delete("/book/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
é
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const result = await booksCollection.deleteOne({ _id: new ObjectId(bookId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.json({ message: "Livre supprimé avec succès" });
    } catch (error) {
        console.error("Une erreur s'est produite lors de la suppression du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
});

const PORT = process.env.API_PORT || 3000;
const HOST = process.env.API_HOST || "localhost";

app.listen(PORT, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});