export const hasDigitalArtList = [
    "2-Moon Jelly",
    "30's Milkman",
    "AiMbot-3940",
    "Alieums",
    "Anhybite",
    "B.F. Bugleberry",
    "Baghost",
    "Baroot",
    "Bat Boy",
    "Batter Up!",
    "Beelt",
    "Biogator",
    "Birthday Basher",
    "Bittersweet Peaks",
    "Blademaus",
    "Bobbin",
    "Bonus Luck",
    "Bottled Nightmare",
    "Brightlight Casino",
    "Byeah Beast",
    "Byeah Prime",
    "Card Back",
    "Carl Griffinsteed",
    "Carnival Kingdom",
    "Cauldrosaur",
    "Chromanova",
    "Cloud King",
    "Cloudtop Observatory",
    "Connival",
    "Coral Shoal",
    "Crabcha",
    "Dance-Off",
    "Demon Lord Zeraxos",
    "Dig Dog",
    "Double or Nothing",
    "Dragossum",
    "Dream-Eater Bat",
    "Dredgelord",
    "Droplganger",
    "Dunk Tank",
    "Dustbunny",
    "Eat It Up!",
    "Encouraging Cheer",
    "Exbeelosion",
    "Excavate",
    "Fleech",
    "Forgotten Tableau",
    "Fretzel",
    "Friendtriloquist",
    "Frog Slap",
    "Gachatron",
    "Game Wipe",
    "Giant Enemy Spider",
    "Glow Angel",
    "Glowing Cavern",
    "Glueman",
    "Gourmander",
    "Grandpa",
    "Greedy Grinner",
    "Green Screen",
    "Harlefin",
    "Highland Destrier",
    "Hydraxolotl",
    "Hypnodaze",
    "Intimidate",
    "Invasive Wavestrider",
    "JBA Power Card: Upgrade",
    "Jerma Earth",
    "Jerma Moon",
    "Jerma Pluto",
    "Jerma",
    "Jestapod",
    "JEX",
    "Jukeboxer",
    "Jup the 2nd",
    "Kelpdrake Root",
    "Launch Card",
    "Lavabrys Shark",
    "Lizard Wizard",
    "Lobboss",
    "Meowdy",
    "Minereel",
    "Moosaic",
    "Mountidary",
    "Mr. Anycard",
    "Mr. Greenz",
    "Nebula Ray",
    "Nightmite",
    "Nyxwing",
    "One Guy",
    "Open Geode",
    "Optimal Illusion",
    "Otto",
    "Peep-Peep",
    "Pirouette",
    "Ponderer's Grove",
    "Pourcelain",
    "Protojammer",
    "Pteroducktyl",
    "Puddle Puppy",
    "Razzleposs",
    "Reorganize",
    "Rich Rat",
    "Rumble Ring",
    "Rummage Rat",
    "Scritchy Scratch",
    "Seasprinter",
    "Serachime",
    "Sheetopillar",
    "Sludge",
    "Small Enemy Spider",
    "Snaptrap",
    "Sneaky Rat",
    "Sneezie",
    "Song of Protection",
    "Spectocular",
    "Starbit Cluster",
    "Stormplaty",
    "Strong Rat",
    "Surprise Snack",
    "Sus Guy",
    "Sweet Tooth",
    "Tactical Rocket Launcher",
    "Tadpal",
    "The Big Baker",
    "The Cauldron",
    "The Giant Rat",
    "Thingamachicken",
    "Toadstool",
    "Top Rope",
    "Volca Isle",
    "Wall Dad",
];
export function cardNameToCardImageURL(cardName, getScan = false) {
    if (cardName === null || cardName === undefined) {
        return null;
    }
    const fixedName = cardName
        .replaceAll("+", "%2B")
        .replaceAll("ñ", "n");
    if (hasDigitalArtList.includes(cardName) && !getScan) {
        return "https://www.grotto-bestiary.com/images/digital-cards/" + fixedName.replaceAll(" ", "%20") + ".jpg";
    }
    else {
        return "https://grotto-beast-cards-images.s3.us-east-2.amazonaws.com/" + fixedName.replaceAll(" ", "+") + ".webp";
    }
}
export function cardNameToCardDetailsURL(cardName) {
    if (cardName === null || cardName === undefined) {
        return null;
    }
    return ("http://grotto-bestiary.com/card-details?cardName=" +
        cardName
            .replaceAll("+", "%2B")
            .replaceAll("ñ", "n")
            .replaceAll(" ", "+"));
}
export function getHostFromReq(req) {
    let uri = `${req.protocol}://${req.get("host")}/`;
    uri = uri.replace("localhost:5000", "localhost:3000");
    if (process.env.CODESPACES) {
        uri = `https://${process.env.CODESPACE_NAME}-3000.app.github.dev/`;
    }
    return uri;
}
export async function checkLogin(req, res, next) {
    try {
        //Check that user is logged in
        if (typeof req.session?.user?.id !== "string") {
            res.status(401).send({
                error: "Unauthorized",
                error_message: "You must be logged in to change your inventory.",
            });
            return;
        }
        next();
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ error: "Internal Server Error" });
    }
}
;
