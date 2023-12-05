import { ObjectId } from "mongodb";
import { db } from "../../../db/conn.mjs";
import { HoloType } from "../../../generated/graphql.mjs";
function replaceSlashes(value) {
    return value === '-' ? null : value;
}
function replaceHoloType(value) {
    switch (value) {
        case "Bubble": {
            return HoloType.Bubble;
        }
        case "Dots": {
            return HoloType.Dots;
        }
        case "Shatter": {
            return HoloType.Shatter;
        }
        case "Wave": {
            return HoloType.Sheen;
        }
    }
}
export function dbCardToGraphCard(c) {
    return {
        id: c._id.toString(),
        digital: c.Digital ?? false,
        number: replaceSlashes(c.Number),
        name: c.Name,
        type: c.Type,
        epic: c.Epic === 'TRUE',
        power: replaceSlashes(c.Power),
        goal: replaceSlashes(c.Goal),
        cost: replaceSlashes(c.Cost),
        effect: replaceSlashes(c.Effect),
        fun: replaceSlashes(c.Fun),
        rarity: c.Rarity,
        holoType: replaceHoloType(c.HoloType),
        artists: c.Artists.map(a => ({
            name: a.Artist,
            link: a.Link
        })),
    };
}
const resolvers = {
    Query: {
        async cards(_, { filter }) {
            const collection = db.collection("cards");
            const query = {};
            filter ??= {};
            // ID
            if (filter.id !== undefined) {
                query._id = new ObjectId(filter.id);
            }
            // Simple equality
            if (filter.number !== undefined) {
                query.Number = filter.number;
            }
            if (filter.digital !== undefined) {
                query.Digital = filter.digital;
            }
            if (filter.rarity !== undefined) {
                query.Rarity = filter.rarity;
            }
            // Different strings
            if (filter.epic !== undefined) {
                query.Epic = filter.epic ? "TRUE" : "FALSE";
            }
            switch (filter.holoType) {
                case HoloType.Bubble: {
                    query.HoloType = "Bubble";
                    break;
                }
                case HoloType.Dots: {
                    query.HoloType = "Dots";
                    break;
                }
                case HoloType.Shatter: {
                    query.HoloType = "Shatter";
                    break;
                }
                case HoloType.Sheen: {
                    query.HoloType = "Wave";
                    break;
                }
            }
            // Regex's
            if (filter.name !== undefined) {
                query.Name = {
                    $regex: filter.name.pattern,
                    $options: filter.name.options ?? ''
                };
            }
            if (filter.type !== undefined) {
                query.Type = {
                    $regex: filter.type.pattern,
                    $options: filter.type.options ?? ''
                };
            }
            if (filter.effect !== undefined) {
                query.Effect = {
                    $regex: filter.effect.pattern,
                    $options: filter.effect.options ?? ''
                };
            }
            if (filter.fun !== undefined) {
                query.Fun = {
                    $regex: filter.fun.pattern,
                    $options: filter.fun.options ?? ''
                };
            }
            // Int comparisons
            if (filter.power !== undefined) {
                query.Power = {
                    [`$${filter.power.op}`]: filter.power.value
                };
            }
            if (filter.goal !== undefined) {
                query.Goal = {
                    [`$${filter.goal.op}`]: filter.goal.value
                };
            }
            if (filter.cost !== undefined) {
                query.Cost = {
                    [`$${filter.cost.op}`]: filter.cost.value
                };
            }
            const cardsRaw = await collection.find(query).toArray();
            return cardsRaw.map(dbCardToGraphCard);
        },
        async card(_, { id }) {
            let collection = db.collection("cards");
            let query = { _id: new ObjectId(id) };
            return dbCardToGraphCard(await collection.findOne(query));
        },
    }
};
export default resolvers;
