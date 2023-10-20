import { db } from "../db/conn.mjs";

const holoTypes = [
    {
        Name: "Glueman",
        HoloType: "Dots"
    },
    {
        Name: "B.F. Bugleberry",
        HoloType: "Shatter"
    },
    {
        Name: "Grandpa",
        HoloType: "Wave"
    },
    {
        Name: "Demon Lord Zeraxos",
        HoloType: "Dots"
    },
    {
        Name: "JEX",
        HoloType: "Shatter"
    },
    {
        Name: "Mr. Greenz",
        HoloType: "Bubble"
    },
    {
        Name: "Jerma",
        HoloType: "Dots"
    },
    {
        Name: "Carl Griffinsteed",
        HoloType: "Shatter"
    },
    {
        Name: "Jerma Earth",
        HoloType: "Bubble"
    },
    {
        Name: "Jerma Moon",
        HoloType: "Dots"
    },
    {
        Name: "Jerma Venus",
        HoloType: "Shatter"
    },
    {
        Name: "Jerma Pluto",
        HoloType: "Wave"
    },
    {
        Name: "The Jerm",
        HoloType: "Bubble"
    },
    {
        Name: "Byeah Prime",
        HoloType: "Shatter"
    },
    {
        Name: "Bat Boy",
        HoloType: "Shatter"
    },
    {
        Name: "Green Screen",
        HoloType: "Shatter"
    },
    {
        Name: "The Giant Rat",
        HoloType: "Dots"
    },
    {
        Name: "Sus Guy",
        HoloType: "Wave"
    },
    {
        Name: "The Jem Wizard",
        HoloType: "Shatter"
    },
    {
        Name: "Otto",
        HoloType: "Dots"
    },
    {
        Name: "Scritchy Scratch",
        HoloType: "Shatter"
    },
    {
        Name: "Wall Dad",
        HoloType: "Shatter"
    },
    {
        Name: "Giant Enemy Spider",
        HoloType: "Wave"
    },
    {
        Name: "30's Milkman",
        HoloType: "Wave"
    },
    {
        Name: "Michael the Birthday Boy",
        HoloType: "Dots"
    },
    {
        Name: "One Guy",
        HoloType: "Bubble"
    },
    {
        Name: "Pirouette",
        HoloType: "Dots"
    },
    {
        Name: "Abacus 1.0",
        HoloType: "Wave"
    },
    {
        Name: "The Big Baker",
        HoloType: "Wave"
    },
    {
        Name: "Cloud King",
        HoloType: "Shatter"
    },
    {
        Name: "Pine Princess",
        HoloType: "Wave"
    },
    {
        Name: "Naturalist Langston",
        HoloType: "Wave"
    },
    {
        Name: "Bittersweet Peaks",
        HoloType: "Dots"
    },
    {
        Name: "Brightlight Casino",
        HoloType: "Wave"
    },
    {
        Name: "Carnival Kingdom",
        HoloType: "Dots"
    },
    {
        Name: "Cloudtop Observatory",
        HoloType: "Wave"
    },
    {
        Name: "Coral Shoal",
        HoloType: "Bubble"
    },
    {
        Name: "Dank Sewer",
        HoloType: "Wave"
    },
    {
        Name: "Forgotten Tableau",
        HoloType: "Shatter"
    },
    {
        Name: "Fossil Ridge",
        HoloType: "Wave"
    },
    {
        Name: "Fruit Jungle",
        HoloType: "Dots"
    },
    {
        Name: "Glowing Cavern",
        HoloType: "Shatter"
    },
    {
        Name: "Haunted Manor",
        HoloType: "Shatter"
    },
    {
        Name: "Magical Canopy",
        HoloType: "Dots"
    },
    {
        Name: "Maze of Many Ways",
        HoloType: "Wave"
    },
    {
        Name: "Metrometropolis",
        HoloType: "Wave"
    },
    {
        Name: "Ponderer's Grove",
        HoloType: "Wave"
    },
    {
        Name: "Rumble Ring",
        HoloType: "Dots"
    },
    {
        Name: "Skeld's Factory",
        HoloType: "Bubble"
    },
    {
        Name: "Skull Valley",
        HoloType: "Wave"
    },
    {
        Name: "Sportball Stadium",
        HoloType: "Dots"
    },
    {
        Name: "Sunspring Field",
        HoloType: "Dots"
    },
    {
        Name: "Volca Isle",
        HoloType: "Wave"
    },
    {
        Name: "+2",
        HoloType: "Dots"
    },
    {
        Name: "-2",
        HoloType: "Shatter"
    },
    {
        Name: "Batter Up!",
        HoloType: "Dots"
    },
    {
        Name: "Bonus Luck",
        HoloType: "Wave"
    },
    {
        Name: "Book of Wonder",
        HoloType: "Wave"
    },
    {
        Name: "Bounty Board",
        HoloType: "Wave"
    },
    {
        Name: "Breakdance Boots",
        HoloType: "Dots"
    },
    {
        Name: "Call for Help",
        HoloType: "Shatter"
    },
    {
        Name: "Clip That!",
        HoloType: "Wave"
    },
    {
        Name: "Copycat",
        HoloType: "Dots"
    },
    {
        Name: "Crazy Stunt",
        HoloType: "Shatter"
    },
    {
        Name: "Dance-Off",
        HoloType: "Dots"
    },
    {
        Name: "Dire Escape",
        HoloType: "Shatter"
    },
    {
        Name: "Double or Nothing",
        HoloType: "Bubble"
    },
    {
        Name: "Dunk Tank",
        HoloType: "Bubble"
    },
    {
        Name: "Eat It Up!",
        HoloType: "Wave"
    },
    {
        Name: "Emergency Rescue",
        HoloType: "Shatter"
    },
    {
        Name: "Encouraging Cheer",
        HoloType: "Bubble"
    },
    {
        Name: "Energizing Drink",
        HoloType: "Bubble"
    },
    {
        Name: "Excavate",
        HoloType: "Shatter"
    },
    {
        Name: "Frog Slap",
        HoloType: "Bubble"
    },
    {
        Name: "Frog's Breath Potion",
        HoloType: "Bubble"
    },
    {
        Name: "Game Wipe",
        HoloType: "Wave"
    },
    {
        Name: "Greedy Grinner",
        HoloType: "Bubble"
    },
    {
        Name: "Up in the Air",
        HoloType: "Dots"
    },
    {
        Name: "Intimidate",
        HoloType: "Bubble"
    },
    {
        Name: "JBA Power Card: Upgrade",
        HoloType: "Wave"
    },
    {
        Name: "Open Geode",
        HoloType: "Shatter"
    },
    {
        Name: "Presto Majesto",
        HoloType: "Dots"
    },
    {
        Name: "Reckless Offroading",
        HoloType: "Bubble"
    },
    {
        Name: "Reorganize",
        HoloType: "Wave"
    },
    {
        Name: "Similar Company",
        HoloType: "Wave"
    },
    {
        Name: "Smushed",
        HoloType: "Shatter"
    },
    {
        Name: "Sneak Thief",
        HoloType: "Shatter"
    },
    {
        Name: "Sole Survivor",
        HoloType: "Bubble"
    },
    {
        Name: "Song of Protection",
        HoloType: "Shatter"
    },
    {
        Name: "Starbit Cluster",
        HoloType: "Shatter"
    },
    {
        Name: "Surprise Snack",
        HoloType: "Bubble"
    },
    {
        Name: "Tactical Rocket Launcher",
        HoloType: "Wave"
    },
    {
        Name: "The Cauldron",
        HoloType: "Bubble"
    },
    {
        Name: "Top Rope",
        HoloType: "Shatter"
    },
    {
        Name: "Try Another!",
        HoloType: "Bubble"
    },
    {
        Name: "Wild Dreams",
        HoloType: "Bubble"
    },
    {
        Name: "2-Moon Jelly",
        HoloType: "Bubble"
    },
    {
        Name: "AiMbot-3940",
        HoloType: "Dots"
    },
    {
        Name: "Alieums",
        HoloType: "Dots"
    },
    {
        Name: "Anhybite",
        HoloType: "Shatter"
    },
    {
        Name: "Awoobis",
        HoloType: "Wave"
    },
    {
        Name: "Baghost",
        HoloType: "Wave"
    },
    {
        Name: "Baroot",
        HoloType: "Bubble"
    },
    {
        Name: "Beelt",
        HoloType: "Bubble"
    },
    {
        Name: "Biogator",
        HoloType: "Wave"
    },
    {
        Name: "Birds of Fortune",
        HoloType: "Dots"
    },
    {
        Name: "Birthday Basher",
        HoloType: "Dots"
    },
    {
        Name: "Blademaus",
        HoloType: "Shatter"
    },
    {
        Name: "Bobbin",
        HoloType: "Wave"
    },
    {
        Name: "Bottled Nightmare",
        HoloType: "Wave"
    },
    {
        Name: "Byeah Beast",
        HoloType: "Bubble"
    },
    {
        Name: "Cauldrosaur",
        HoloType: "Bubble"
    },
    {
        Name: "Centilead",
        HoloType: "Wave"
    },
    {
        Name: "Chromanova",
        HoloType: "Wave"
    },
    {
        Name: "Connival",
        HoloType: "Shatter"
    },
    {
        Name: "Crabcha",
        HoloType: "Bubble"
    },
    {
        Name: "Dig Dog",
        HoloType: "Bubble"
    },
    {
        Name: "Dragossom",
        HoloType: "Dots"
    },
    {
        Name: "Dream-Eater Bat",
        HoloType: "Wave"
    },
    {
        Name: "Dredgelord",
        HoloType: "Wave"
    },
    {
        Name: "Droplganger",
        HoloType: "Bubble"
    },
    {
        Name: "Dustbunny",
        HoloType: "Dots"
    },
    {
        Name: "EEE-Vamp",
        HoloType: "Dots"
    },
    {
        Name: "Exbeelosion",
        HoloType: "Wave"
    },
    {
        Name: "Excasaur",
        HoloType: "Wave"
    },
    {
        Name: "Festive Mimic",
        HoloType: "Shatter"
    },
    {
        Name: "Fleech",
        HoloType: "Bubble"
    },
    {
        Name: "Fretzel",
        HoloType: "Dots"
    },
    {
        Name: "Friendtriloquist",
        HoloType: "Bubble"
    },
    {
        Name: "Frostbite",
        HoloType: "Shatter"
    },
    {
        Name: "Gachatron",
        HoloType: "Dots"
    },
    {
        Name: "Ghastlight",
        HoloType: "Shatter"
    },
    {
        Name: "Glow Angel",
        HoloType: "Shatter"
    },
    {
        Name: "Googlow",
        HoloType: "Bubble"
    },
    {
        Name: "Gourmander",
        HoloType: "Wave"
    },
    {
        Name: "Harlefin",
        HoloType: "Bubble"
    },
    {
        Name: "Highland Destrier",
        HoloType: "Dots"
    },
    {
        Name: "Highlyre",
        HoloType: "Wave"
    },
    {
        Name: "Hypnodaze",
        HoloType: "Dots"
    },
    {
        Name: "Hydraxolotl",
        HoloType: "Wave"
    },
    {
        Name: "Invasive Wavestrider",
        HoloType: "Wave"
    },
    {
        Name: "Jelly Monkey",
        HoloType: "Bubble"
    },
    {
        Name: "Jestapod",
        HoloType: "Bubble"
    },
    {
        Name: "Jukeboxer",
        HoloType: "Shatter"
    },
    {
        Name: "Jup the 1st",
        HoloType: "Wave"
    },
    {
        Name: "Jup the 2nd",
        HoloType: "Wave"
    },
    {
        Name: "Jup the 3rd",
        HoloType: "Wave"
    },
    {
        Name: "Jup the 4th",
        HoloType: "Wave"
    },
    {
        Name: "Kelpdrake Root",
        HoloType: "Bubble"
    },
    {
        Name: "Lavabrys Shark",
        HoloType: "Wave"
    },
    {
        Name: "Leozard",
        HoloType: "Shatter"
    },
    {
        Name: "Lizard Wizard",
        HoloType: "Dots"
    },
    {
        Name: "Lobboss",
        HoloType: "Bubble"
    },
    {
        Name: "Meowdy",
        HoloType: "Wave"
    },
    {
        Name: "Metranomatone",
        HoloType: "Dots"
    },
    {
        Name: "Minereel",
        HoloType: "Shatter"
    },
    {
        Name: "Moosaic",
        HoloType: "Shatter"
    },
    {
        Name: "Mountidary",
        HoloType: "Dots"
    },
    {
        Name: "Mr. Anycard",
        HoloType: "Dots"
    },
    {
        Name: "Nebula Ray",
        HoloType: "Dots"
    },
    {
        Name: "Nightmite",
        HoloType: "Bubble"
    },
    {
        Name: "Nyxwing",
        HoloType: "Wave"
    },
    {
        Name: "Optimal Illusion",
        HoloType: "Shatter"
    },
    {
        Name: "Paintergeist",
        HoloType: "Shatter"
    },
    {
        Name: "Peep-Peep",
        HoloType: "Shatter"
    },
    {
        Name: "Plunky",
        HoloType: "Wave"
    },
    {
        Name: "Poñata",
        HoloType: "Dots"
    },
    {
        Name: "Pourcelain",
        HoloType: "Dots"
    },
    {
        Name: "Protojammer",
        HoloType: "Wave"
    },
    {
        Name: "Pteroducktyl",
        HoloType: "Wave"
    },
    {
        Name: "Puddle Puppy",
        HoloType: "Bubble"
    },
    {
        Name: "Radroot",
        HoloType: "Shatter"
    },
    {
        Name: "Razzleposs",
        HoloType: "Dots"
    },
    {
        Name: "Rich Rat",
        HoloType: "Bubble"
    },
    {
        Name: "Rummage Rat",
        HoloType: "Bubble"
    },
    {
        Name: "Scorptus",
        HoloType: "Wave"
    },
    {
        Name: "Seasprinter",
        HoloType: "Wave"
    },
    {
        Name: "Serachime",
        HoloType: "Shatter"
    },
    {
        Name: "Sheetopillar",
        HoloType: "Dots"
    },
    {
        Name: "Sir Greaves",
        HoloType: "Shatter"
    },
    {
        Name: "Sludge",
        HoloType: "Wave"
    },
    {
        Name: "Small Enemy Spider",
        HoloType: "Wave"
    },
    {
        Name: "Snailsman",
        HoloType: "Dots"
    },
    {
        Name: "Snaptrap",
        HoloType: "Wave"
    },
    {
        Name: "Sneaky Rat",
        HoloType: "Wave"
    },
    {
        Name: "Sneezie",
        HoloType: "Bubble"
    },
    {
        Name: "Spectocular",
        HoloType: "Shatter"
    },
    {
        Name: "Stormplaty",
        HoloType: "Wave"
    },
    {
        Name: "Strong Rat",
        HoloType: "Shatter"
    },
    {
        Name: "Stumpalump",
        HoloType: "Bubble"
    },
    {
        Name: "Sweet Tooth",
        HoloType: "Dots"
    },
    {
        Name: "Tadpal",
        HoloType: "Bubble"
    },
    {
        Name: "Thamacrow",
        HoloType: "Shatter"
    },
    {
        Name: "Thingamachicken",
        HoloType: "Bubble"
    },
    {
        Name: "Toadstool",
        HoloType: "Wave"
    },
    {
        Name: "Toyrex",
        HoloType: "Wave"
    },
    {
        Name: "Trickstircuit",
        HoloType: "Shatter"
    },
    {
        Name: "Veggiroo",
        HoloType: "Wave"
    },
    {
        Name: "Weeniemutt",
        HoloType: "Dots"
    },
    {
        Name: "Zapbit",
        HoloType: "Wave"
    }
]


for (const holoType of holoTypes) {
    try {
        await db.collection("cards").findOneAndUpdate(
            {
                Name: holoType.Name
            },
            {
                $set: {
                    HoloType: holoType.HoloType
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
}
