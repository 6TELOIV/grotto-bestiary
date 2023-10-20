import { db, init_db } from "../db";
import {
    parseStringToNumberAndOperator,
    parseStringToRegex,
} from "../Helpers/SearchHelpers";

function checkComparision(toCheck, op, value) {
    switch (op) {
        case "$lt":
            return toCheck < value;
        case "$gt":
            return toCheck > value;
        case "$lte":
            return toCheck <= value;
        case "$gte":
            return toCheck >= value;
        case "$eq":
            return toCheck === value;
        case "$ne":
            return toCheck !== value;
        default:
            return null;
    }
}

/** @param {URLSearchParams} searchParams */
async function getSearchResults(searchParams) {
    const parsedSearchParams = {};

    if (searchParams.get("nameRaw")) {
        parsedSearchParams.Name = parseStringToRegex(
            searchParams.get("nameRaw"),
            searchParams.get("nameMatch")
        );
    }
    if (searchParams.get("typeRaw")) {
        parsedSearchParams.Type = parseStringToRegex(
            searchParams.get("typeRaw"),
            searchParams.get("typeMatch")
        );
    }
    if (searchParams.get("effectRaw")) {
        parsedSearchParams.Effect = parseStringToRegex(
            searchParams.get("effectRaw"),
            searchParams.get("effectMatch")
        );
    }

    if (searchParams.get("powerRaw")) {
        let [power, powerOperator] = parseStringToNumberAndOperator(
            searchParams.get("powerRaw")
        );
        parsedSearchParams.Power = power;
        parsedSearchParams.PowerOp = powerOperator;
    }
    if (searchParams.get("goalRaw")) {
        let [goal, goalOperator] = parseStringToNumberAndOperator(
            searchParams.get("goalRaw")
        );
        parsedSearchParams.Goal = goal;
        parsedSearchParams.GoalOp = goalOperator;
    }
    if (searchParams.get("costRaw")) {
        let [cost, costOperator] = parseStringToNumberAndOperator(
            searchParams.get("costRaw")
        );
        parsedSearchParams.Cost = cost;
        parsedSearchParams.CostOp = costOperator;
    }
    if (searchParams.get("isEpic") === "Yes") {
        parsedSearchParams.Epic = "TRUE";
    } else if (searchParams.get("isEpic") === "No") {
        parsedSearchParams.Epic = "FALSE";
    }

    return await getCards(parsedSearchParams);
}

/** @returns {Promise<Array<any>>} */
async function getCards({
    Name,
    Type,
    Effect,
    Power,
    PowerOp,
    Goal,
    GoalOp,
    Cost,
    CostOp,
    Epic,
}) {
    await init_db();

    let result = db.cards.toCollection();
    if (typeof Name !== "undefined" && Name !== null) {
        const re = new RegExp(Name, "i");
        result.filter((card) => re.test(card.Name));
    }
    if (typeof Type !== "undefined" && Type !== null) {
        const re = new RegExp(Type, "i");
        result.filter((card) => re.test(card.Type));
    }
    if (typeof Effect !== "undefined" && Effect !== null) {
        const re = new RegExp(Effect, "i");
        result.filter((card) => re.test(card.Effect));
    }
    if (typeof Power !== "undefined" && Power !== null) {
        result.filter((card) => checkComparision(card.Power, PowerOp, Power));
    }
    if (typeof Goal !== "undefined" && Goal !== null) {
        result.filter((card) => checkComparision(card.Goal, GoalOp, Goal));
    }
    if (typeof Cost !== "undefined" && Cost !== null) {
        result.filter((card) => checkComparision(card.Cost, CostOp, Cost));
    }
    if (typeof Epic !== "undefined" && Epic !== null) {
        result.filter((card) => card.Epic === Epic);
    }

    return await result.toArray();
}

async function modifyInventory(cards, delta = false) {
    return await fetch("/inventory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cards,
            delta
        }),
    });
}

async function modifyUser(userUpdates) {
    const res = await fetch("/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userUpdates),
    });
    if (!res.ok) {
        throw await res.json();
    }
    const userCurrent = JSON.parse(sessionStorage.getItem("user"));
    sessionStorage.setItem("user", JSON.stringify({
        ...userCurrent,
        ...userUpdates
    }));
}

async function getUserById(userId) {
    const userResponse = await fetch(
        "/user?" + new URLSearchParams({ id: userId }),
        {
            method: "GET",
        }
    );
    const user = await userResponse.json();
    await mapUserInventory(user);
    return user;
}

async function getUser(userInfo) {
    const userResponse = await fetch(
        "/user?" +
        new URLSearchParams({
            username: userInfo.username,
            tag: userInfo.discriminator,
        }),
        {
            method: "GET",
        }
    );
    const user = await userResponse.json();
    await mapUserInventory(user);
    return user;
}

async function mapUserInventory(user) {
    const invItems = user.inventory;
    const cards = await getCards({});
    user.inventory = invItems.map((invItem) => {
        const card = cards.find((card) => invItem._id === card._id);
        return { ...card, ...invItem };
    });
}

function cardNameToCardImageURL(cardName, extension = ".webp") {
    if (cardName === null || cardName === undefined) {
        return null;
    }

    return (
        "https://grotto-beast-cards-images.s3.us-east-2.amazonaws.com/" +
        cardName
            .replaceAll("+", "%2B")
            .replaceAll("ñ", "n")
            .replaceAll(" ", "+") +
        extension
    );
}

function cardNameToDigitalImageURL(cardName, fullart = false) {
    if (cardName === null || cardName === undefined) {
        return null;
    }

    return (
        "/images/digital-cards" +
        (fullart ? "-fullart/" : "/") +
        cardName
            .replaceAll("+", "%2B")
            .replaceAll("ñ", "n")
            .replaceAll(":", "")
            .replaceAll(" ", "%20") + ".jpg"
    );
}


async function getTrades(_id, holo) {
    let tradeResponse = await fetch("/trades?" + new URLSearchParams({ _id, holo }), {
        method: "GET"
    });

    if (tradeResponse.ok) {
        return await tradeResponse.json();
    } else {
        throw new Error(
            `Trade Fetch Failed: ${tradeResponse.status} - ${tradeResponse.statusText}`
        );
    }
}

async function getTradesWithUser(userId) {
    let tradeResponse = await fetch(
        "/trades?" + new URLSearchParams({ userId }),
        {
            method: "GET"
        });

    if (tradeResponse.ok) {
        return await tradeResponse.json();
    } else {
        throw new Error(
            `Trade Fetch Failed: ${tradeResponse.status} - ${tradeResponse.statusText}`
        );
    }
}

async function getTradeById(tradeId) {
    let tradeResponse = await fetch(
        "/trades?" + new URLSearchParams({ tradeId }),
        {
            method: "GET"
        });

    if (tradeResponse.ok) {
        return await tradeResponse.json();
    } else {
        throw new Error(
            `Trade Fetch Failed: ${tradeResponse.status} - ${tradeResponse.statusText}`
        );
    }
}

async function login(code, state) {
    let loginResponse = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            code,
            state,
        }),
    });

    if (loginResponse.ok) {
        return await loginResponse.json();
    } else {
        throw new Error(
            `Login Failed: ${loginResponse.status} - ${loginResponse.statusText}`
        );
    }
}

function parseUsername(username) {
    if (username === null || typeof username === "undefined") {
        return null;
    }

    let [_username, _discriminator] = username.split("#");
    if (_username.charAt(0) === "@") {
        _username = _username.substring(1);
    }
    return { username: _username, discriminator: _discriminator };
}

function toUsername(user) {
    return `${user?.username}#${user?.discriminator}`;
}

function toDisplayName(user) {
    return user.display_name ?? user.global_name ?? user.username;
}

function getLoginURL(path = '/account') {
    const validChars =
        "ABCDEFHIJKLMNPQRSUVWXYZabcdefhijklmnpqrsuvwxyz0123456789";
    let array = new Uint8Array(64);
    window.crypto.getRandomValues(array);
    array = array.map((x) => validChars.charCodeAt(x % validChars.length));
    const state = String.fromCharCode.apply(null, array);
    return `https://discord.com/api/oauth2/authorize?client_id=1107766147484491796&redirect_uri=${encodeURIComponent(
        window.location.origin + '/login'
    )}&response_type=code&scope=identify&prompt=none&state=${state}GOTO${encodeURIComponent(path)}`;
}

export {
    getSearchResults,
    getCards,
    getTrades,
    getTradesWithUser,
    getTradeById,
    getUser,
    getUserById,
    modifyInventory,
    modifyUser,
    cardNameToCardImageURL,
    cardNameToDigitalImageURL,
    login,
    toDisplayName,
    toUsername,
    parseUsername,
    getLoginURL,
};
