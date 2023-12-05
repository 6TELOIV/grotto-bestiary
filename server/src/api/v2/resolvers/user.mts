import { Resolvers } from "../../../generated/graphql.mjs";
import { db } from "../../../db/conn.mjs";
import { dbCardToGraphCard } from "./card.mjs";

function dbUserToGraphUser(u: any) {
    return {
        id: u.id,
        name: u.display_name ?? u.global_name ?? u.username,
        discordUsername: u.username,
        discordDiscriminator: u.discriminator,
        discordAvatar: u.avatar,
        discordBanner: u.banner,
        discordBannerColor: u.banner_color,
        region: u.region,
        bio: u.bio,
        completedTrades: u.completedTrades,
        inventory: (u.inventory ?? []).map(i => {
            return {
                holo: i.holo,
                tradeQuantity: i.TradeQty,
                wishQuantity: i.WishQty,
                quantity: i.Qty,
                card: dbCardToGraphCard(i.card)
            }
        }),
        autoInventoryRules: (u.autoInventoryRules ?? []).map(air => ({
            name: air.name,
            filter: air.filter,
            tradeQuantity: air.tradeQty,
            wishQuantity: air.wishQty
        })),
        lastOnline: new Date(u.last_online),
    }
}

const findTrades = (cards, holoSensitive) => {
    return [
        {
            '$set': {
                'inventory': {
                    '$map': {
                        'input': '$inventory',
                        'as': 'item',
                        'in': {
                            '$mergeObjects': [
                                {
                                    'holo': false
                                },
                                '$$item'
                            ]
                        }
                    }
                }
            }
        },
        {
            '$set': {
                'inventory': {
                    '$filter': {
                        'input': '$inventory',
                        'as': 'item',
                        'cond': {
                            '$or': cards.map(c => {
                                const f: any = {
                                    '$and': [
                                        {
                                            '$eq': ['$$item._id', c.id]
                                        },
                                        {
                                            '$gt': ['$$item.TradeQty', 0]
                                        }
                                    ]
                                }
                                if (holoSensitive) {
                                    f['$and'].push({
                                        '$in': ['$$item.holo', c.holo ? [true] : [false, null]]
                                    });
                                }
                                return f;
                            })
                        }
                    }
                }
            }
        }, {
            '$match': {
                'inventory': {
                    '$exists': true,
                    '$not': {
                        '$size': 0
                    }
                }
            }
        },
    ]
}

const addCardsToInventoryPipeline = [
    {
        '$set': {
            'inventory': {
                '$map': {
                    'input': '$inventory',
                    'as': 'item',
                    'in': {
                        '$mergeObjects': [
                            '$$item', {
                                '_id': {
                                    '$toObjectId': '$$item._id'
                                }
                            }
                        ]
                    }
                }
            }
        }
    }, {
        '$lookup': {
            'from': 'cards',
            'localField': 'inventory._id',
            'foreignField': '_id',
            'as': 'inventoryCards'
        }
    }, {
        '$set': {
            'inventory': {
                '$map': {
                    'input': '$inventory',
                    'as': 'item',
                    'in': {
                        '$mergeObjects': [
                            '$$item',
                            {
                                'card': {
                                    '$arrayElemAt': [
                                        {
                                            '$filter': {
                                                'input': '$inventoryCards',
                                                'as': 'card',
                                                'cond': {
                                                    '$eq': [
                                                        '$$card._id', '$$item._id'
                                                    ]
                                                }
                                            }
                                        }, 0
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        }
    }, {
        '$project': {
            'inventoryCards': 0
        }
    },
]

const resolvers: Resolvers = {
    Query: {
        async user(_, { id }) {
            let collection = db.collection("users");
            let query = { id };

            const user = (await collection.aggregate([
                { "$match": query },
                ...addCardsToInventoryPipeline
            ]).toArray())?.[0];

            return dbUserToGraphUser(user);
        },
        async tradesForUser(_, { id, holoSensitive }) {
            let collection = db.collection("users");
            let query = { id };
            const cards = ((await collection.findOne(query)).inventory ?? []).filter(i => i.WishQty > 0).map(c => ({ id: c._id, holo: !!(c.holo) }));

            console.log(JSON.stringify([
                {
                    '$match': {
                        'id': {
                            '$ne': id
                        }
                    }
                },
                ...findTrades(cards, holoSensitive),
                ...addCardsToInventoryPipeline
            ]))

            return (await collection.aggregate([
                {
                    '$match': {
                        'id': {
                            '$ne': id
                        }
                    }
                },
                ...findTrades(cards, holoSensitive),
                ...addCardsToInventoryPipeline
            ]).toArray()).map(dbUserToGraphUser);
        },
        async tradesForList(_, { cards, holoSensitive }) {
            let collection = db.collection("users");

            return (await collection.aggregate([
                ...findTrades(cards, holoSensitive),
                ...addCardsToInventoryPipeline
            ]).toArray()).map(dbUserToGraphUser);

        }
    }
}

export default resolvers;