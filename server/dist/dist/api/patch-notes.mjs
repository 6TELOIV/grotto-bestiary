import { Router } from "express";
import { db } from "../db/conn.mjs";
const router = Router();
router.get("/latest", async (req, res) => {
    // get latest patch notes
    const patchNotes = await db.collection("patchNotes").findOne({}, { sort: { $natural: -1 } });
    res.status(200).json(patchNotes);
});
export { router };
