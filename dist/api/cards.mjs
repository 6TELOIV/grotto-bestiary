import { Router } from 'express';
import { db } from '../db/conn.mjs';
const router = Router();
router.post('/cards', async (req, res, next) => {
    let cardsFound = await db.collection('cards').find().toArray();
    res.send(JSON.stringify(cardsFound));
});
export { router };
