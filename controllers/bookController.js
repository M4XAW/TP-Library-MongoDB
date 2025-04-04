import { booksCollection } from "../config/database.js";
import { ObjectId } from "mongodb";

export const getAllBooks = async (req, res) => {
    try {
        const { author, available, genres, minRating, sortBy, order } = req.query;
        const filters = {};

        if (author) {
            filters.author = author;
        }

        if (available) {
            filters.available = available === "true";
        }

        if (genres) {
            filters.genres = genres;
        }

        if (minRating) {
            const parsedMinRating = parseFloat(minRating);
            if (!isNaN(parsedMinRating)) {
                filters.rating = { $gte: parsedMinRating };
            }
        }

        const sortOptions = {};
        if (sortBy) {
            const sortField = sortBy === "rating" ? "rating" : sortBy === "year" ? "year" : null;
            if (sortField) {
                sortOptions[sortField] = order === "desc" ? -1 : 1;
            }
        }
        
        const books = await booksCollection.find(filters).sort(sortOptions).toArray();

        if (books.length === 0) {
            return res.status(404).json({ message: "Aucun livre trouvé" });
        }

        res.json(books);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des livres :", error);
        res.status(500).json({ error: "Une erreur interne du serveur" });
    }
}

export const getBookById = async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const book = await booksCollection.findOne({ _id: new ObjectId(bookId) });
        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.json(book);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

export const createBook = async (req, res) => {
    try {
        const { title, author, year, available, genress, rating, stock } = req.body;
        if (!title || !author) {
            return res.status(400).json({ error: "Le titre et l'author sont obligatoires" });
        }

        if (year && (isNaN(year) || year < 1800)) {
            return res.status(400).json({ error: "L'année doit être un nombre supérieur ou égal à 1800" });
        }

        if (rating && (isNaN(rating) || rating < 0 || rating > 5)) {
            return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5" });
        }
        
        if (genress && !Array.isArray(genress)) {
            return res.status(400).json({ error: "Les genress doivent être un tableau" });
        }

        const newBook = { title, author, year, available, genress, rating, stock };

        const result = await booksCollection.insertOne(newBook);
        res.status(201).json({ message: "Livre ajouté avec succès", bookId: result.insertedId });
    } catch (error) {
        console.error("Une erreur s'est produite lors de l'ajout du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

export const updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        // Empêchez la mise à jour de l'ID du livre
        const { _id, ...updateFields } = req.body;

        if (!ObjectId.isValid(bookId)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        if (updateFields.year && (isNaN(updateFields.year) || updateFields.year < 1800)) {
            return res.status(400).json({ error: "L'année doit être un nombre supérieur ou égal à 1800" });
        }

        if (updateFields.rating && (isNaN(updateFields.rating) || updateFields.rating < 0 || updateFields.rating > 5)) {
            return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5" });
        }

        if (updateFields.genress && !Array.isArray(updateFields.genress)) {
            return res.status(400).json({ error: "Les genress doivent être un tableau" });
        }

        const result = await booksCollection.updateOne({ _id: new ObjectId(bookId) }, { $set: updateFields });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }
        res.json({ message: "Livre mis à jour avec succès" });
    } catch (error) {
        console.error("Une erreur s'est produite lors de la mise à jour du livre :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
}

export const deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
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
}