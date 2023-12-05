import Eris from "eris";
import { db } from "../db/conn.mjs";
import { discordBotSecret } from "../secrets/secrets.mjs";
import { cardNameToCardDetailsURL, cardNameToCardImageURL } from "../helpers.mjs";
/**** Discord Setup ****/
/** @type {Eris.Client} */
export const bot = new Eris(discordBotSecret, {
    intents: ["guildMessages"],
});
export function initBot() {
    bot.on("ready", async () => {
        // When the bot is ready
        console.log("Ready!"); // Log "Ready!"
        bot.bulkEditCommands([
            {
                name: "Create Trade",
                type: 2
            }, {
                name: "View Inventory",
                type: 2
            }, {
                name: "View Decks",
                type: 2
            }
        ]).catch(console.error);
        // Clear guild commands
        bot.bulkEditGuildCommands("1124390998227820574", []);
    });
    bot.on("error", (err) => {
        console.error(err); // or your preferred logger
    });
    if (process.env.NODE_ENV && !process.env.CODESPACES) {
        // Commands
        bot.on("interactionCreate", async (interaction) => {
            if (interaction.type === 2) {
                let user;
                switch (interaction.data.name) {
                    case "Create Trade":
                        await interaction.acknowledge(64);
                        // verify that the interaction is with a different user
                        if (interaction.member.user.id === interaction.data.target_id) {
                            await interaction.createFollowup("You cannot trade with yourself.");
                            return;
                        }
                        // verify user has an account
                        user = await db.collection("users").findOne({ id: interaction.data.target_id });
                        if (user === null) {
                            await interaction.createFollowup(`That user has not registered an account. They can create one at https://www.grotto-bestiary.com/login`);
                            return;
                        }
                        await interaction.createFollowup(`https://www.grotto-bestiary.com/trades/${interaction.data.target_id}`);
                        break;
                    case "View Inventory":
                        await interaction.acknowledge(64);
                        // verify user has an account
                        user = await db.collection("users").findOne({ id: interaction.data.target_id });
                        if (user === null) {
                            await interaction.createFollowup(`That user has not registered an account. They can create one at https://www.grotto-bestiary.com/login`);
                            return;
                        }
                        await interaction.createFollowup(`https://www.grotto-bestiary.com/inventory?username=${user.username}&tag=${user.discriminator}`);
                        break;
                    case "View Decks":
                        await interaction.acknowledge(64);
                        // verify user has an account
                        user = await db.collection("users").findOne({ id: interaction.data.target_id });
                        if (user === null) {
                            await interaction.createFollowup(`That user has not registered an account. They can create one at https://www.grotto-bestiary.com/login`);
                            return;
                        }
                        await interaction.createFollowup(`https://www.grotto-bestiary.com/decks-explorer/${interaction.data.target_id}`);
                        break;
                }
            }
        });
        // {{card}}, {{!card}}, and {{?card}} message parsing
        bot.on("messageCreate", async (msg) => {
            try {
                // limit message length
                if (msg.content?.length > 2000) {
                    return;
                }
                else {
                    // find {{text}} in the message and add to cards array
                    const cardRegex = /{{([^{}]*)}}/g;
                    const cardNames = [];
                    let results;
                    while ((results = cardRegex.exec(msg.content)) !== null) {
                        cardNames.push(results[1]);
                    }
                    // get card info from DB
                    const cardPromises = {};
                    const allCardPromisesArray = [];
                    const getImage = {};
                    const getScanImage = {};
                    const getTrades = {};
                    for (const name of cardNames) {
                        let fixName = name;
                        if (name.indexOf("!") === 0) {
                            fixName = name.substring(1);
                            if (fixName.indexOf("!") === 0) {
                                fixName = fixName.substring(1);
                                getScanImage[fixName] = true;
                            }
                            getImage[fixName] = true;
                        }
                        if (name.indexOf("?") === 0) {
                            fixName = name.substring(1);
                            getTrades[fixName] = true;
                        }
                        if (fixName.length > 100) {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    description: `Card name length of ${fixName.length} characters is too long.\n(Limit: 100 characters)`,
                                    color: 3342593,
                                },
                            }).catch(console.error);
                        }
                        else {
                            cardPromises[fixName] = db.collection("cards").find({
                                Name: {
                                    $regex: fixName
                                        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") //escape special characters
                                        .replace("n", "[nñ]"), //poñata
                                    $options: "i",
                                }
                            });
                            allCardPromisesArray.push(cardPromises[fixName]);
                        }
                    }
                    // wait for all cards
                    await Promise.all(allCardPromisesArray);
                    // make embed for each
                    for (const cardName in cardPromises) {
                        const card = await (await cardPromises[cardName]).sort({ Name: 1 }).next();
                        if (card) {
                            card._id = card._id.toString();
                            if (getImage[cardName]) {
                                bot.createMessage(msg.channel.id, {
                                    content: cardNameToCardDetailsURL(card.Name),
                                    embed: {
                                        title: card.Name,
                                        url: cardNameToCardDetailsURL(card.Name),
                                        color: 3342593,
                                        image: {
                                            url: cardNameToCardImageURL(card.Name, getScanImage[cardName]),
                                        },
                                        description: `${card.Artists.map((a) => {
                                            return `🎨 [${a.Artist}](${a.Link})` + (a.Link.indexOf("https://twitter.com/") === 0 ? ` [(Mirror)](${a.Link.replace("twitter.com", "nitter.net")})` : "");
                                        }).join("\n")}`,
                                    },
                                }).catch(console.error);
                            }
                            else if (getTrades[cardName]) {
                                // find all users whos trade list contains this card
                                const users = await db.collection("users").find({
                                    inventory: {
                                        $elemMatch: {
                                            _id: card._id,
                                            TradeQty: { $gt: 0 },
                                        },
                                    },
                                }).toArray();
                                // if no users found, send message saying so
                                if (users.length === 0) {
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            title: card.Name + " Trades",
                                            description: `No users have ${card.Name} for trade.`,
                                            color: 3342593,
                                        },
                                    }).catch(console.error);
                                }
                                else {
                                    // send message with list of users and their trade qty and if the card is holo
                                    const trades = [];
                                    for (const user of users) {
                                        const userCard = user.inventory.filter((c) => c._id === card._id && c.TradeQty > 0);
                                        for (const c of userCard) {
                                            trades.push({
                                                name: `@${user.username}${user.discriminator !== "0" ? `#${user.discriminator}` : ""}`,
                                                value: `[${c.TradeQty}x ${card.Name}${c.holo ? " ✨" : ""}](https://www.grotto-bestiary.com/trades/${user.id}?card=${card._id}&holo=${c.holo ? "true" : "false"})`,
                                                qty: c.TradeQty,
                                                holo: c.holo,
                                            });
                                        }
                                    }
                                    bot.createMessage(msg.channel.id, {
                                        embed: {
                                            title: card.Name + " Trades",
                                            fields: trades.sort((a, b) => {
                                                if (!a.holo === !b.holo) {
                                                    return b.qty - a.qty;
                                                }
                                                else if (a.holo) {
                                                    return -1;
                                                }
                                                else {
                                                    return 1;
                                                }
                                            }).slice(0, 25).map((t) => {
                                                return {
                                                    name: t.name,
                                                    value: t.value,
                                                    inline: true,
                                                };
                                            }),
                                            color: 3342593,
                                        },
                                    }).catch(console.error);
                                }
                            }
                            else {
                                bot.createMessage(msg.channel.id, {
                                    content: cardNameToCardDetailsURL(card.Name),
                                    embed: {
                                        title: card.Name,
                                        url: cardNameToCardDetailsURL(card.Name),
                                        description: `${card.Cost !== "-" ? `<:starbiticon:1128569464556900352>${card.Cost} ` : ""}${card.Goal !== "-" ? `<:hearticon:1128569328929869895> ${card.Goal} ` : ""}${card.Power !== "-" ? `<:powericon:1128569396261048340>${card.Power} ` : ""}\n${card.Effect}\n*${card.Fun}*\n${card.Artists.map((a) => {
                                            return `🎨 [${a.Artist}](${a.Link})` + (a.Link.indexOf("https://twitter.com/") === 0 ? ` [(Mirror)](${a.Link.replace("twitter.com", "nitter.net")})` : "");
                                        }).join("\n")}`,
                                        color: 3342593,
                                        thumbnail: {
                                            url: cardNameToCardImageURL(card.Name),
                                        },
                                    },
                                }).catch(console.error);
                            }
                        }
                        else {
                            bot.createMessage(msg.channel.id, {
                                embed: {
                                    description: `Card named ${cardName} not found`,
                                    color: 3342593,
                                },
                            }).catch(console.error);
                        }
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    bot.connect().catch(console.error); // Get the bot to connect to Discord
}
export async function sendTradeDMToUser(toUserId, message, url) {
    if (process.env.NODE_ENV && !process.env.CODESPACES) {
        const dmChannel = await bot.getDMChannel(toUserId);
        dmChannel.createMessage({
            embed: {
                title: "Trade Request",
                description: message,
                url,
                color: 3342593,
            },
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: "View",
                            style: 5,
                            url,
                        },
                    ],
                },
            ],
        }).catch(console.error);
    }
}
