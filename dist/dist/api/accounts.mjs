import { Router } from "express";
import { db } from "../db/conn.mjs";
import { sendTradeDMToUser } from "../bot/bot.mjs";
import { discordClientID, discordClientSecret, kofiVerificationCode } from "../secrets/secrets.mjs";
import fetch from "node-fetch";
import { ObjectId } from "mongodb";
import { checkLogin, getHostFromReq } from "../helpers.mjs";
const router = Router();
const discordAPIBaseURL = "https://discord.com/api/v10";
//ko-fi API to add user "supporter" tag
router.post("/kofi", async (req, res, next) => {
    try {
        console.log("request: " + JSON.stringify(req.body));
        const data = JSON.parse(req.body?.data);
        //only process legitimate requests
        if (data?.verification_token === kofiVerificationCode) {
            //immediately end request (no data will be sent back)
            res.status(200).end();
            //find the user ID code and set their "supporter" flag to `true`r" flag to `true`
            const userID = /(?<=KO&).*(?=&FI)/g.exec(data.message)?.[0];
            console.log("userID: " + userID);
            const updateResult = await db.collection("users").findOneAndUpdate({
                id: userID,
            }, {
                $set: {
                    supporter: true,
                    supporterBadge: "trans",
                },
            });
            console.log(updateResult.value);
        }
        else {
            res.status(400).end();
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
//check if user is logged in for the following routes
router.post("/user", checkLogin);
router.post("/autoInventory", checkLogin);
router.post("/inventory", checkLogin);
router.post("/trades", checkLogin);
router.post("/nuke", checkLogin);
// Create account from discord token
router.post("/login", async (req, res, next) => {
    try {
        let redirect_uri = getHostFromReq(req) + "login";
        let tokenResponse = await fetch(discordAPIBaseURL + "/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: discordClientID,
                client_secret: discordClientSecret,
                grant_type: "authorization_code",
                code: req.body.code,
                state: req.body.state,
                redirect_uri,
            }),
        });
        if (!tokenResponse.ok) {
            res.statusCode = tokenResponse.status;
            res.send(await tokenResponse.json());
            return;
        }
        req.session.token = await tokenResponse.json();
        let userResponse = await fetch(discordAPIBaseURL + "/users/@me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${req.session.token.access_token}`,
            },
        });
        if (!userResponse.ok) {
            res.statusCode = userResponse.status;
            res.send(await userResponse.json());
            return;
        }
        let user = await userResponse.json();
        const userResult = await db.collection("users").findOneAndUpdate({ id: user.id }, { $set: { ...user, last_online: Date.now() } }, { upsert: true, returnDocument: "after" });
        await db.collection("users").updateOne({ id: user.id, inventory: { $exists: false } }, { $set: { inventory: [] } });
        req.session.user = userResult.value;
        res.send(JSON.stringify(userResult.value));
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
router.get("/user", async (req, res, next) => {
    try {
        if (req.query.id) {
            const user = await db.collection("users").findOne({
                id: req.query.id,
            });
            if (user === null) {
                res.status(404).send({ error: "Not Found", error_message: `User ${req.query.id} not found` });
                return;
            }
            else {
                res.send(JSON.stringify(user));
                return;
            }
        }
        else {
            let [username, discriminator] = req.query.username?.split("#");
            if (typeof req.query.tag !== "undefined") {
                discriminator = req.query.tag;
            }
            if (username.charAt(0) === "@") {
                username = username.substring(1);
            }
            const user = await db.collection("users").findOne({
                username: username,
                discriminator: discriminator,
            });
            if (user === null) {
                res.status(404).send({ error: "Not Found", error_message: `User @` });
                return;
            }
            else {
                res.send(JSON.stringify(user));
                return;
            }
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Get trades for a certain card
router.get("/trades", async (req, res, next) => {
    try {
        //When the user sends a card, find all users who have that card.
        if (!req.query._id) {
            next();
        }
        else {
            const user = await db.collection("users").findOne({
                id: req.session.user.id,
            });
            if (!user) {
                res.status(500).send({
                    error: "Internal Server Error",
                    error_message: "session's user does not exist",
                });
                return;
            }
            const myTradelist = user.inventory?.filter((card) => card.TradeQty > 0);
            const holoFilter = {};
            let holoOwnedFilter = [];
            if (req.query.holo === "true") {
                holoFilter["holo"] = {
                    $eq: true,
                };
                holoOwnedFilter.push({
                    $eq: ["$$owned.holo", true],
                });
            }
            else if (req.query.holo === "false") {
                holoFilter["holo"] = {
                    $ne: true,
                };
                holoOwnedFilter.push({
                    $ne: ["$$owned.holo", true],
                });
            }
            const users = db.collection("users").aggregate([
                {
                    $match: {
                        id: { $ne: req.session.user.id },
                        $and: [
                            {
                                inventory: {
                                    $elemMatch: {
                                        _id: req.query._id,
                                        ...holoFilter,
                                        TradeQty: { $gt: 0 },
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        username: 1,
                        discriminator: 1,
                        display_name: 1,
                        global_name: 1,
                        id: 1,
                        ownedCards: {
                            $filter: {
                                input: "$inventory",
                                as: "owned",
                                cond: {
                                    $and: [{ $eq: ["$$owned._id", req.query._id] }, { $gt: ["$$owned.TradeQty", 0] }, ...holoOwnedFilter],
                                },
                            },
                        },
                        wantedCards: {
                            $filter: {
                                input: "$inventory",
                                as: "wanted",
                                cond: {
                                    $and: [{ $gt: ["$$wanted.WishQty", 0] }],
                                },
                            },
                        },
                        _id: 0,
                    },
                },
                {
                    $project: {
                        username: 1,
                        discriminator: 1,
                        display_name: 1,
                        global_name: 1,
                        id: 1,
                        wantedCards: 1,
                        owned: { $sum: "$ownedCards.TradeQty" },
                    },
                },
                {
                    $limit: 50,
                },
            ]);
            // find the total number of cards that each other user wants
            // that this user has at least one of
            const responseUsers = [];
            for await (const user of users) {
                const userCards = user.wantedCards;
                let total = 0;
                for (const card of userCards) {
                    const myCards = myTradelist.filter((myCard) => myCard._id === card._id && !myCard.holo == !card.holo);
                    if (myCards.length > 0) {
                        for (const myCard of myCards) {
                            total += Math.min(myCard.TradeQty, card.WishQty);
                        }
                    }
                }
                responseUsers.push({
                    user: {
                        username: user.username,
                        discriminator: user.discriminator,
                        display_name: user.display_name,
                        global_name: user.global_name,
                        id: user.id,
                    },
                    owned: user.owned,
                    wanted: total,
                });
            }
            res.send(JSON.stringify(responseUsers));
            return;
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Get trade for a specific user
router.get("/trades", async (req, res, next) => {
    try {
        //When the user requests with a user, get their active trade with that user from the trades collection
        if (!req.query.userId) {
            next();
        }
        else {
            const trade = await db.collection("trades").findOne({
                $and: [
                    {
                        $or: [
                            { "user1.id": req.session.user.id, "user2.id": req.query.userId },
                            { "user1.id": req.query.userId, "user2.id": req.session.user.id },
                        ],
                    },
                    {
                        status: "Pending",
                    },
                ],
            });
            res.send(JSON.stringify(trade));
            return;
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Get a specific trade
router.get("/trades", async (req, res, next) => {
    try {
        //When the user requests with a tradeId, get that trade from the trades collection
        if (!req.query.tradeId) {
            next();
        }
        else {
            const trade = await db.collection("trades").findOne({
                _id: new ObjectId(req.query.tradeId),
            });
            // only send messages if the user is part of the trade
            res.send(JSON.stringify({
                ...trade,
                messages: req.session.user.id === trade.user1.id || req.session.user.id === trade.user2.id ? trade.messages : [],
            }));
            return;
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Get all trades for the logged user
router.get("/trades", async (req, res, next) => {
    try {
        //When the user requests with "getAll" true, get all their active trades from the trades collection
        if (!req.query.getAll) {
            next();
        }
        else {
            const trades = db.collection("trades").find({
                $or: [{ "user1.id": req.session.user.id }, { "user2.id": req.session.user.id }],
            });
            res.send(JSON.stringify(await trades.toArray()));
        }
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Create a new trade or update an existing one
router.post("/trades", async (req, res, next) => {
    try {
        if (req.body?.action !== "update") {
            next();
            return;
        }
        // Create and store a record in the trades collection if the logged user doesn't have an open trade with this user already. Update the record if they do.
        if (!req.body.user) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a `user` key",
            });
            return;
        }
        // Check that if a trade exists in the database, that the logged in user is not user1 (this means that they did the last action and are waiting for the other user to respond)
        let trade = await db.collection("trades").findOne({
            $and: [
                {
                    "user1.id": req.session.user.id,
                },
                {
                    "user2.id": req.body.user.id,
                },
                {
                    status: "Pending",
                }
            ],
        });
        if (trade) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You have an open trade with this user and are awaiting their response.",
            });
            return;
        }
        if (!req.body.user1Cards) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a `user1Cards` key",
            });
            return;
        }
        if (!req.body.user2Cards) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a `user2Cards` key",
            });
            return;
        }
        if (req.body.tradeMessage) {
            req.body.tradeMessage = req.body.tradeMessage.substring(0, 200);
        }
        const result = await db.collection("trades").findOneAndUpdate({
            $and: [
                {
                    $or: [
                        {
                            $and: [
                                {
                                    "user1.id": req.session.user.id,
                                },
                                {
                                    "user2.id": req.body.user.id,
                                },
                            ],
                        },
                        {
                            $and: [
                                {
                                    "user1.id": req.body.user.id,
                                },
                                {
                                    "user2.id": req.session.user.id,
                                },
                            ],
                        },
                    ],
                },
                {
                    status: "Pending",
                },
            ],
        }, {
            $set: {
                user1: {
                    id: req.session.user.id,
                    username: req.session.user.username,
                    discriminator: req.session.user.discriminator,
                    global_name: req.session.user.global_name,
                },
                user2: {
                    id: req.body.user.id,
                    username: req.body.user.username,
                    discriminator: req.body.user.discriminator,
                    global_name: req.body.user.global_name,
                },
                user1Cards: req.body.user1Cards,
                user2Cards: req.body.user2Cards,
                status: "Pending",
                lastAction: Date.now(),
            },
        }, {
            upsert: true,
            returnDocument: "after",
        });
        trade = result.value;
        // add the message to the trade message log if there is a message
        if (req.body.tradeMessage) {
            await db.collection("trades").updateOne({
                _id: trade._id,
            }, {
                $push: {
                    messages: {
                        user: {
                            id: req.session.user.id,
                        },
                        message: req.body.tradeMessage,
                        timestamp: Date.now(),
                    },
                },
            });
        }
        // try to send a message to the other user that they have a trade awaiting their response
        try {
            await sendTradeDMToUser(req.body.user.id, `${req.session.user.global_name ?? req.session.user.username} has sent you an offer!${req.body.tradeMessage ? `\n\nMessage:\n${req.body.tradeMessage}` : ""}`, `${getHostFromReq(req)}view-trade/${trade._id}`);
        }
        catch (e) {
            console.error(e);
        }
        res.send({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Accept or Reject a trade
router.post("/trades", async (req, res, next) => {
    try {
        if (req.body?.action !== "reject" && req.body?.action !== "accept") {
            next();
            return;
        }
        // Find and mark the trade as rejected or accepted
        if (!req.body.user) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a `user` key",
            });
            return;
        }
        // Check that if a trade exists in the database, that the logged in user is not user1 (this means that they did the last action and are waiting for the other user to respond)
        let trade = await db.collection("trades").findOne({
            $and: [
                {
                    "user1.id": req.session.user.id,
                },
                {
                    "user2.id": req.body.user.id,
                },
                {
                    status: "Pending",
                }
            ],
        });
        if (trade) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You have an open trade with this user and are awaiting their response.",
            });
            return;
        }
        const result = await db.collection("trades").findOneAndUpdate({
            $and: [
                {
                    $and: [
                        {
                            "user1.id": req.body.user.id,
                        },
                        {
                            "user2.id": req.session.user.id,
                        },
                    ],
                },
                {
                    status: "Pending",
                },
            ],
        }, {
            $set: {
                status: req.body.action === "reject" ? "Rejected" : "Accepted",
                lastAction: Date.now(),
            },
        }, {
            returnDocument: "after",
        });
        trade = result.value;
        // try to send a message to the other user that they have a trade result
        try {
            await sendTradeDMToUser(req.body.user.id, `${req.session.user.global_name ?? req.session.user.username} has ${req.body.action}ed your trade${req.body.action === "reject" ? "." : "!"}`, `${getHostFromReq(req)}view-trade/${trade._id}`);
        }
        catch (e) {
            console.error(e);
        }
        res.send({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Validate trade
router.post("/trades", async (req, res, next) => {
    try {
        if (req.body?.action !== "validate") {
            next();
            return;
        }
        // Reject if no tradeId was passed
        if (!req.body.tradeId) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a `tradeId` key",
            });
            return;
        }
        // Reject if that trade is not Accepted
        let trade = await db.collection("trades").findOne({
            _id: new ObjectId(req.body.tradeId),
        });
        if (!trade) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "No trade with that ID exists",
            });
            return;
        }
        if (trade.status !== "Accepted") {
            res.status(400).send({
                error: "Bad Request",
                error_message: "That trade is not in the Accepted state",
            });
            return;
        }
        // Reject if the user is not part of that trade
        if (trade.user1.id !== req.session.user.id && trade.user2.id !== req.session.user.id) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You are not part of that trade",
            });
            return;
        }
        // Reject if the user has already validated the trade
        if ((trade.user1.id === req.session.user.id && trade.user1Validated) || (trade.user2.id === req.session.user.id && trade.user2Validated)) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You have already validated that trade",
            });
            return;
        }
        // Find and mark that the current user has validated the trade
        // User1 case
        await db.collection("trades").updateOne({
            $and: [
                {
                    "user1.id": req.session.user.id,
                },
                {
                    _id: new ObjectId(req.body.tradeId),
                },
            ],
        }, {
            $set: {
                user1Validated: true,
            },
        });
        // User2 case
        await db.collection("trades").updateOne({
            $and: [
                {
                    "user2.id": req.session.user.id,
                },
                {
                    _id: new ObjectId(req.body.tradeId),
                },
            ],
        }, {
            $set: {
                user2Validated: true,
            },
        });
        // Check if both users have validated the trade
        trade = await db.collection("trades").findOne({
            _id: new ObjectId(req.body.tradeId),
        });
        if (trade.user1Validated && trade.user2Validated) {
            //if so, update both users profile completed trade counter
            await db.collection("users").updateOne({
                id: trade.user1.id,
            }, {
                $inc: {
                    completedTrades: 1,
                },
            });
            await db.collection("users").updateOne({
                id: trade.user2.id,
            }, {
                $inc: {
                    completedTrades: 1,
                },
            });
            //also update both users unique traded users set
            await db.collection("users").updateOne({
                id: trade.user1.id,
            }, {
                $addToSet: {
                    uniqueTradedUsers: trade.user2.id,
                },
            });
            await db.collection("users").updateOne({
                id: trade.user2.id,
            }, {
                $addToSet: {
                    uniqueTradedUsers: trade.user1.id,
                },
            });
        }
        res.send({ success: true });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Update inventory after a trade
router.post("/trades", async (req, res, next) => {
    try {
        if (req.body?.action !== "inventory") {
            next();
            return;
        }
        // Reject if no tradeId was passed
        if (!req.body.tradeId) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a `tradeId` key",
            });
            return;
        }
        // Reject if that trade is not Accepted
        let trade = await db.collection("trades").findOne({
            _id: new ObjectId(req.body.tradeId),
        });
        if (!trade) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "No trade with that ID exists",
            });
            return;
        }
        if (trade.status !== "Accepted") {
            res.status(400).send({
                error: "Bad Request",
                error_message: "That trade is not in the Accepted state",
            });
            return;
        }
        // Reject if the user is not part of that trade
        if (trade.user1.id !== req.session.user.id && trade.user2.id !== req.session.user.id) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You are not part of that trade",
            });
            return;
        }
        // Reject if the user has already updated their inventory for the trade
        if ((trade.user1.id === req.session.user.id && trade.user1Inventory) || (trade.user2.id === req.session.user.id && trade.user2Inventory)) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You have already updated your inventory for that trade",
            });
            return;
        }
        // Find current user and update their inventory by decreasing the items they traded away and increasing the items they received
        let user = await db.collection("users").findOne({
            id: req.session.user.id,
        });
        let sentCards;
        let receivedCards;
        if (trade.user1.id === req.session.user.id) {
            sentCards = trade.user1Cards;
            receivedCards = trade.user2Cards;
        }
        else {
            sentCards = trade.user2Cards;
            receivedCards = trade.user1Cards;
        }
        const cards = [];
        for (const card of sentCards) {
            const invCard = user.inventory.find((invCard) => invCard._id === card._id && !invCard.holo == !card.holo);
            if (invCard) {
                cards.push({
                    _id: card._id,
                    holo: card.holo,
                    Qty: Math.max(invCard.Qty - card.qty, 0),
                    TradeQty: Math.max(invCard.TradeQty - card.qty, 0),
                });
            }
        }
        for (const card of receivedCards) {
            const invCard = user.inventory.find((invCard) => invCard._id === card._id && !invCard.holo == !card.holo);
            if (invCard) {
                cards.push({
                    _id: card._id,
                    holo: card.holo,
                    Qty: invCard.Qty + card.qty,
                    WishQty: Math.max(invCard.WishQty - card.qty, 0),
                });
            }
            else {
                cards.push({
                    _id: card._id,
                    holo: card.holo,
                    Qty: card.qty,
                });
            }
        }
        await updateUserInventory(cards, false, req, res);
        // Update the trade to show that the user has updated their inventory
        if (trade.user1.id === req.session.user.id) {
            await db.collection("trades").updateOne({
                _id: new ObjectId(req.body.tradeId),
            }, {
                $set: {
                    user1Inventory: true,
                },
            });
        }
        else {
            await db.collection("trades").updateOne({
                _id: new ObjectId(req.body.tradeId),
            }, {
                $set: {
                    user2Inventory: true,
                },
            });
        }
        res.send({ status: "200", status_message: "inventory modified." });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Update user profile
router.post("/user", async (req, res, next) => {
    try {
        const userUpdate = {};
        if (typeof req.body?.region === "string") {
            userUpdate.region = req.body.region;
        }
        if (typeof req.body?.dms === "boolean") {
            userUpdate.dms = req.body.dms;
        }
        if (typeof req.body?.collapseOnSearch === "boolean") {
            userUpdate.collapseOnSearch = req.body.collapseOnSearch;
        }
        if (typeof req.body?.bio === "string") {
            // only update first 500 characters passed
            userUpdate.bio = req.body.bio?.substring(0, 500);
        }
        if (Object.keys(userUpdate).length === 0 && (typeof req.body?.supporterBadge !== "string" || req.body?.supporterBadge === null)) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include some valid user keys to modify",
            });
            return;
        }
        //update user's preferences
        await db.collection("users").findOneAndUpdate({
            id: req.session.user.id,
        }, {
            $set: userUpdate,
        });
        if (typeof req.body.supporterBadge !== "undefined") {
            await db.collection("users").findOneAndUpdate({
                id: req.session.user.id,
                supporter: true,
            }, {
                $set: {
                    supporterBadge: req.body.supporterBadge,
                },
            });
        }
        res.send({ status: "200", status_message: "user modified." });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Set Auto Inventory Rules for the user
router.post("/autoInventory", async (req, res, next) => {
    try {
        // Check that the body is valid
        if (!Array.isArray(req.body?.rules)) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "`body` must include a valid array of rules",
            });
            return;
        }
        // If there are more than 400 rules, return an error
        if (req.body.rules.length > 400) {
            res.status(400).send({
                error: "Bad Request",
                error_message: "You cannot have more than 400 rules",
            });
            return;
        }
        // Check that the rules are valid and return a descriptive error of what is wrong
        // A valid rule will look like the following object:
        // 
        // {
        //     name?: string,
        //     filter: {
        //         name?: string,
        //         type?: string,
        //         rarity?: string,
        //         holo?: boolean,
        //     },
        //     tradeQty: [
        //         {
        //             case: string like "qty>X", "qty<X", "qty=X", "qty>=X", "qty<=X", "qty!=X", or "default" where X is an integer
        //             value: string like "qty+X", "qty-X", "X+qty", or "X-qty" where X is and integer or number,
        //         },
        //     ],
        //     wishQty: [
        //         {
        //             case: string like "qty>X", "qty<X", "qty=X", "qty>=X", "qty<=X", "qty!=X", or "default" where X is an integer
        //             value: string like "qty+X", "qty-X", "X+qty", or "X-qty" where X is and integer or number,
        //         },
        //     ],
        // },
        for (const rule of req.body.rules) {
            if (typeof rule.filter !== "object") {
                res.status(400).send({
                    error: "Bad Request",
                    error_message: "Each rule must include a filter object",
                });
                return;
            }
            if (typeof rule.tradeQty !== "object") {
                res.status(400).send({
                    error: "Bad Request",
                    error_message: "Each rule must include a tradeQty array",
                });
                return;
            }
            if (typeof rule.wishQty !== "object") {
                res.status(400).send({
                    error: "Bad Request",
                    error_message: "Each rule must include a wishQty array",
                });
                return;
            }
            for (const tradeQty of rule.tradeQty) {
                if (typeof tradeQty.case !== "string") {
                    res.status(400).send({
                        error: "Bad Request",
                        error_message: "Each tradeQty must include a case string",
                    });
                    return;
                }
                if (!/^((qty>|qty<|qty=|qty>=|qty<=|qty!=)\d+|default)/.test(tradeQty.case)) {
                    res.status(400).send({
                        error: "Bad Request",
                        error_message: "Each tradeQty must include a case string like 'qty>X', 'qty<X', 'qty=X', 'qty>=X', 'qty<=X', 'qty!=X', or 'default'",
                    });
                    return;
                }
                if (typeof tradeQty.value !== "string" && typeof tradeQty.value !== "number") {
                    res.status(400).send({
                        error: "Bad Request",
                        error_message: "Each tradeQty must include a value string or number",
                    });
                    return;
                }
                if (typeof tradeQty.value === "string") {
                    if (!/^(qty\+\d+|qty-\d+|\d+\+qty|\d+-qty)$/.test(tradeQty.value)) {
                        res.status(400).send({
                            error: "Bad Request",
                            error_message: "Each tradeQty value must be in the format of 'qty+X' or 'qty-X' where X is an integer or be a number",
                        });
                        return;
                    }
                }
            }
            for (const wishQty of rule.wishQty) {
                if (typeof wishQty.case !== "string") {
                    res.status(400).send({
                        error: "Bad Request",
                        error_message: "Each wishQty must include a case string",
                    });
                    return;
                }
                if (!/^((qty>|qty<|qty=|qty>=|qty<=|qty!=)\d+|default)/.test(wishQty.case)) {
                    res.status(400).send({
                        error: "Bad Request",
                        error_message: "Each wishQty must include a case string like 'qty>X', 'qty<X', 'qty=X', 'qty>=X', 'qty<=X', 'qty!=X', or 'default' where X is an integer",
                    });
                    return;
                }
                if (typeof wishQty.value !== "string" && typeof wishQty.value !== "number") {
                    res.status(400).send({
                        error: "Bad Request",
                        error_message: "Each wishQty must include a value string or number",
                    });
                    return;
                }
                if (typeof wishQty.value === "string") {
                    if (!/^(qty\+\d+|qty-\d+|\d+\+qty|\d+-qty)$/.test(wishQty.value)) {
                        res.status(400).send({
                            error: "Bad Request",
                            error_message: "Each wishQty value must be in the format of 'qty+X' or 'qty-X' where X is an integer or be a number",
                        });
                        return;
                    }
                }
            }
        }
        // if the rules are valid, update the user's autoInventoryRules
        await db.collection("users").findOneAndUpdate({
            id: req.session.user.id,
        }, {
            $set: {
                autoInventoryRules: req.body.rules,
            },
        });
        res.send({ status: "200", status_message: "autoInventoryRules modified." });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Nuke inventory
router.post("/nuke", async (req, res, next) => {
    try {
        // Find the logged in user, and set their inventory to []
        await db.collection("users").findOneAndUpdate({
            id: req.session.user.id,
        }, {
            $set: {
                inventory: [],
            },
        });
        res.status(200).send({ status: "200", status_message: "inventory nuked." });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Modify inventory
router.post("/inventory", async (req, res, next) => {
    //Check that cards array is sent
    if (!Array.isArray(req.body?.cards)) {
        res.status(400).send({
            error: "Bad Request",
            error_message: "`body` must include an array of `cards` to add to inventory.",
        });
        return;
    }
    //Check that all _id entries appear in db.collection('cards')
    const cardChecks = [];
    for (const card of req.body.cards) {
        cardChecks.push(db.collection("cards").findOne({
            _id: new ObjectId(card?._id),
        }));
    }
    const cardCheckResults = await Promise.all(cardChecks);
    if (cardCheckResults.includes(null)) {
        res.status(400).send({
            error: "Bad Request",
            error_message: "`body._ids` contains a bad card _id.",
        });
        return;
    }
    await updateUserInventory(req.body.cards, req.body.delta, req, res);
    res.send({ status: "200", status_message: "inventory modified." });
});
async function updateUserInventory(cards, delta, req, res) {
    //get the user's current inventory
    const user = await db.collection("users").findOne({
        id: req.session.user.id,
    });
    if (!user) {
        res.status(500).send({
            error: "Internal Server Error",
            error_message: "session's user does not exist",
        });
        return;
    }
    const inventory = user.inventory ?? [];
    const cardInfo = await db.collection("cards").find({}).toArray();
    function getCardInfo(card) {
        return cardInfo.find((c) => c._id.toHexString() === card._id);
    }
    //inc values specifed by amounts specified
    for (const card of cards) {
        const invItemIndex = inventory.findIndex((invItem) => invItem._id === card._id && !invItem.holo === !card.holo);
        if (invItemIndex >= 0) {
            const invItem = inventory[invItemIndex];
            if (delta) {
                invItem.Qty = (invItem.Qty ?? 0) + (card?.Qty ?? 0);
            }
            else {
                invItem.Qty = card?.Qty ?? invItem.Qty ?? 0;
            }
        }
        else {
            inventory.push({
                _id: card._id,
                holo: card?.holo,
                Qty: card?.Qty ?? 0,
            });
        }
        const invItem = inventory.find((invItem) => invItem._id === card._id && !invItem.holo === !card.holo);
        // apply the update rules, and if none apply, use the value from the card
        // rules look like this:
        // {
        //     name?: string,
        //     filter: {
        //         name?: string,
        //         type?: string,
        //         rarity?: string,
        //         holo?: boolean,
        //     },
        //     tradeQty: [
        //         {
        //             case: string like "qty>X", "qty<X", "qty=X", "qty>=X", "qty<=X", "qty!=X", or "default" where X is an integer
        //             value: string like "qty+X", "qty-X", "X+qty", or "X-qty" where X is and integer or number,
        //         },
        //     ],
        //     wishQty: [
        //         {
        //             case: string like "qty>X", "qty<X", "qty=X", "qty>=X", "qty<=X", "qty!=X", or "default" where X is an integer
        //             value: string like "qty+X", "qty-X", "X+qty", or "X-qty" where X is and integer or number,
        //         },
        //     ],
        // }
        //
        // and are applied in order, so the first rule that matches is applied
        // A rule matches if all of the filter properties present match the card
        function handleCase(qtyCase, fieldToUpdate) {
            // get the value that should be applied to the field if the case matches
            //  - if the value is a number, it is the value
            //  - if the value is a string, it is a formula to calculate the value
            //    - if it looks like "qty+X" or "qty-X", it is the current qty plus or minus X
            //    - if it looks like "X+qty" or "X-qty", it is X plus or minus the current qty
            let value = qtyCase.value;
            if (typeof qtyCase.value === "string") {
                const qty = invItem.Qty ?? 0;
                if (qtyCase.value.match(/qty[+-]\d+/)) {
                    value = qty + parseInt(qtyCase.value.match(/\d+/)[0]) * (qtyCase.value.match(/qty[+]/) ? 1 : -1);
                }
                else if (qtyCase.value.match(/\d+[+-]qty/)) {
                    value = parseInt(qtyCase.value.match(/\d+/)[0]) + qty * (qtyCase.value.match(/[+]qty/) ? 1 : -1);
                }
                else {
                    console.error("invalid value", qtyCase.value);
                    return false;
                }
            }
            if (qtyCase.case === "default") {
                invItem[fieldToUpdate] = value;
                return true;
            }
            const qty = invItem.Qty ?? 0;
            const caseType = qtyCase.case.match(/[!><=]=?/)[0];
            const caseQty = parseInt(qtyCase.case.match(/\d+/)[0]);
            switch (caseType) {
                case ">":
                    if (qty > caseQty) {
                        invItem[fieldToUpdate] = value;
                        return true;
                    }
                    break;
                case "<":
                    if (qty < caseQty) {
                        invItem[fieldToUpdate] = value;
                        return true;
                    }
                    break;
                case "=":
                    if (qty == caseQty) {
                        invItem[fieldToUpdate] = value;
                        return true;
                    }
                    break;
                case ">=":
                    if (qty >= caseQty) {
                        invItem[fieldToUpdate] = value;
                        return true;
                    }
                    break;
                case "<=":
                    if (qty <= caseQty) {
                        invItem[fieldToUpdate] = value;
                        return true;
                    }
                    break;
                case "!=":
                    if (qty != caseQty) {
                        invItem[fieldToUpdate] = value;
                        return true;
                    }
                    break;
                default:
                    console.error("bad case", tradeQtyCase.case);
                    break;
            }
            return false;
        }
        const cardInfo = getCardInfo(card);
        const rules = user.autoInventoryRules ?? [];
        let ruleApplied = false;
        for (const rule of rules) {
            // Name and type allow for the * as a wildcard which should match any substring where present
            if (typeof rule.filter.name === "string") {
                const nameRegex = new RegExp(rule.filter.name?.replace(/\*/g, ".*"), "i");
                if (!nameRegex.test(cardInfo.Name))
                    continue;
            }
            if (typeof rule.filter.type === "string") {
                const typeRegex = new RegExp(rule.filter.type?.replace(/\*/g, ".*"), "i");
                if (!typeRegex.test(cardInfo.Type))
                    continue;
            }
            // Rarity and holo must match exactly
            if (typeof rule.filter.rarity === "string" && rule.filter.rarity !== cardInfo.Rarity)
                continue;
            if (typeof rule.filter.holo === "boolean" && !rule.filter.holo !== !card.holo)
                continue;
            for (const tradeQtyCase of rule.tradeQty) {
                if (handleCase(tradeQtyCase, "TradeQty"))
                    break;
            }
            for (const wishQtyCase of rule.wishQty) {
                if (handleCase(wishQtyCase, "WishQty"))
                    break;
            }
            ruleApplied = true;
            break;
        }
        if (!ruleApplied) {
            invItem.TradeQty = card?.TradeQty ?? invItem.TradeQty ?? 0;
            invItem.WishQty = card?.WishQty ?? invItem.WishQty ?? 0;
        }
        // remove the item if it has no quantity
        if (invItem.Qty == 0 && invItem.TradeQty == 0 && invItem.WishQty == 0) {
            inventory.splice(invItemIndex, 1);
        }
    }
    //update user's inventory
    await db.collection("users").findOneAndUpdate({
        id: req.session.user.id,
    }, {
        $set: {
            inventory,
        },
    });
}
export { router };
