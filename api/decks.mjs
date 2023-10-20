import { Router } from "express";
import { db } from "../db/conn.mjs";
import { checkLogin } from "../helpers.mjs";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/decks", async (req, res, next) => {
    try {
        if (!req.query.id) {
            return next();
        }
        res.status(200).send((await db.collection("users").findOne({ id: req.query.id }, { projection: { _id: 0, decks: 1 } })).decks ?? []);
        return;
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal server error" });
    }
});

router.get("/decks", checkLogin);
router.get("/decks", async (req, res) => {
    try {
        res.status(200).send((await db.collection("users").findOne({ id: req.session.user.id }, { projection: { _id: 0, decks: 1 } })).decks ?? []);
        return;
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal server error" });
        return;
    }
});

router.post("/decks", checkLogin);
router.post("/decks", async (req, res) => {
    try {
        const { name, cards, format, challenger, _id } = req.body;
        if (!name || !cards) {
            res.status(400).send({ error: "Missing name or cards" });
            return;
        }
        // if the deck collection has a deck wtih that ID and the user is not the owner, return 403
        const existingDeck = await db.collection("decks").findOne({ _id: new ObjectId(_id) });
        if (existingDeck && existingDeck.ownerID !== req.session.user.id) {
            res.status(403).send({ error: "You do not own this deck" });
            return;
        }
        // if the deck collection has a deck with that ID and the user is the owner, update the deck
        if (existingDeck && existingDeck.ownerID === req.session.user.id) {
            await db.collection("decks").updateOne({ _id: new ObjectId(_id) }, { $set: { name, cards, format, challenger, lastModified: new Date() } });
            await db.collection("users").updateOne({ id: req.session.user.id, "decks._id": new ObjectId(_id) }, { $set: { "decks.$.name": name, "decks.$.lastModified": new Date() } });
            res.status(200).send({ message: "Deck updated" });
            return;
        }
        // if the deck collection does not have a deck with that ID, create a new deck
        const insertResult = await db.collection("decks").insertOne({ name, cards, format, challenger, ownerID: req.session.user.id, createdOn: new Date(), lastModified: new Date() });
        // add the deck ID to the user's decks array
        await db.collection("users").updateOne({ id: req.session.user.id }, { $push: { decks: { name, _id: insertResult.insertedId, lastModified: new Date() } } });
        res.status(200).send({ message: "Deck created", _id: insertResult.insertedId });
        return;
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal server error" });
        return;
    }
});

router.delete("/decks", checkLogin);
router.delete("/decks", async (req, res) => {
    try {
        const { _id } = req.body;
        const existingDeck = await db.collection("decks").findOne({ _id: new ObjectId(_id) });
        if (!existingDeck) {
            res.status(404).send({ error: "No such deck exists" });
            return;
        }
        if (existingDeck.ownerID !== req.session.user.id) {
            res.status(403).send({ error: "You do not own this deck" });
            return;
        }
        await db.collection("decks").deleteOne({ _id: new ObjectId(_id) });
        await db.collection("users").updateOne({ id: req.session.user.id }, { $pull: { "decks": { _id: new ObjectId(_id) } } });
        res.status(200).send({ message: "Deck updated" });
        return;
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal server error" });
        return;
    }
});

router.get("/decks/:id", async (req, res) => {
    try {
        const deck = await db.collection("decks").findOne({ _id: new ObjectId(req.params.id) });
        if (!deck) {
            res.status(404).send({ error: "Deck not found" });
            return;
        }
        res.status(200).send(deck);
        return;
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal server error" });
        return;
    }
});
export { router };