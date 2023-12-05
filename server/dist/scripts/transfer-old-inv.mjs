import { db } from "../db/conn.mjs";
const users = db.collection("users").find({});
(async () => {
    for await (const user of users) {
        const newInventory = [];
        for (const card of user.inventory) {
            let inError = false;
            if (typeof card.Qry === "number") {
                console.log(user.username, card);
                newInventory.push({
                    _id: card._id,
                    Qty: card.qty ?? card.Qry ?? 0,
                    TradeQty: card.tradeQty ?? card.TradeQty ?? 0,
                    WishQty: card.wishQty ?? card.WishQty ?? 0,
                    holo: true,
                });
                inError = true;
            }
            else if (typeof card.qty === "number") {
                console.log(user.username, card);
                if (card.qty || card.tradeQty || card.wishQty) {
                    newInventory.push({
                        _id: card._id,
                        Qty: card.qty ?? card.Qty ?? 0,
                        TradeQty: card.tradeQty ?? card.TradeQty ?? 0,
                        WishQty: card.wishQty ?? card.WishQty ?? 0,
                    });
                }
                if (card.holoQty || card.holoTradeQty || card.holoWishQty) {
                    newInventory.push({
                        _id: card._id,
                        Qty: card.holoQty ?? card.Qty ?? 0,
                        TradeQty: card.holoTradeQty ?? card.TradeQty ?? 0,
                        WishQty: card.holoWishQty ?? card.WishQty ?? 0,
                        holo: true,
                    });
                }
                inError = true;
            }
            if (!inError) {
                newInventory.push(card);
            }
        }
        db.collection("users").findOneAndUpdate({
            username: user.username,
        }, {
            $set: {
                inventory: newInventory,
            },
        });
    }
})();
