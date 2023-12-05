import { db } from "../db/conn.mjs";
const artists = [
    {
        Artist: "Absterarts",
        Artists: [
            {
                Artist: "Absterarts",
                Link: "https://twitter.com/absterarts",
            },
        ],
    },
    {
        Artist: "Ashlelang",
        Artists: [
            {
                Artist: "Ashlelang",
                Link: "https://twitter.com/Ashlelang",
            },
        ],
    },
    {
        Artist: "Bellymouth",
        Artists: [
            {
                Artist: "Bellymouth",
                Link: "https://twitter.com/BellymouthArt",
            },
        ],
    },
    {
        Artist: "Blordow",
        Artists: [
            {
                Artist: "Blordow",
                Link: "https://twitter.com/blordow",
            }
        ],
    },
    {
        Artist: "Corax",
        Artists: [
            {
                Artist: "Corax",
                Link: "https://twitter.com/corax42",
            },
        ],
    },
    {
        Artist: "Gwen M.",
        Artists: [
            {
                Artist: "Gwen M.",
                Link: "https://twitter.com/alltheangelssay",
            },
        ],
    },
    {
        Artist: "Hollulu",
        Artists: [
            {
                Artist: "Hollulu",
                Link: "https://twitter.com/meekcheep",
            },
        ],
    },
    {
        Artist: "Hollulu & Sturner",
        Artists: [
            {
                Artist: "Hollulu",
                Link: "https://twitter.com/meekcheep",
            },
            {
                Artist: "Sturner",
                Link: "https://twitter.com/Sturnerart",
            },
        ],
    },
    {
        Artist: "Jason Rainville",
        Artists: [
            {
                Artist: "Jason Rainville",
                Link: "https://twitter.com/rhineville",
            },
        ],
    },
    {
        Artist: "Jerma",
        Artists: [
            {
                Artist: "Jerma",
                Link: "https://twitter.com/Jerma985",
            },
        ],
    },
    {
        Artist: "kevins_computer",
        Artists: [
            {
                Artist: "kevins_computer",
                Link: "https://twitter.com/kevins_computer",
            },
        ],
    },
    {
        Artist: "Melscribbles",
        Artists: [
            {
                Artist: "Melscribbles",
                Link: "https://twitter.com/melscribbles",
            },
        ],
    },
    {
        Artist: "Melscribbles & Hollulu",
        Artists: [
            {
                Artist: "Melscribbles",
                Link: "https://twitter.com/melscribbles",
            },
            {
                Artist: "Hollulu",
                Link: "https://twitter.com/meekcheep",
            },
        ],
    },
    {
        Artist: "Milkbox",
        Artists: [
            {
                Artist: "Milkbox",
                Link: "https://twitter.com/milkbox103",
            },
        ],
    },
    {
        Artist: "SammNnn",
        Artists: [
            {
                Artist: "SammNnn",
                Link: "https://twitter.com/SamNewelle",
            },
        ],
    },
    {
        Artist: "SammNnn & Sturner",
        Artists: [
            {
                Artist: "SammNnn",
                Link: "https://twitter.com/SamNewelle",
            },
            {
                Artist: "Sturner",
                Link: "https://twitter.com/Sturnerart",
            },
        ],
    },
    {
        Artist: "Siins",
        Artists: [
            {
                Artist: "Siins",
                Link: "https://twitter.com/SIIINS",
            },
        ],
    },
    {
        Artist: "Slab Mangrave",
        Artists: [
            {
                Artist: "Slab Mangrave",
                Link: "https://twitter.com/SlabMangrave",
            },
        ],
    },
    {
        Artist: "Snoozincopter",
        Artists: [
            {
                Artist: "Snoozincopter",
                Link: "https://twitter.com/Snoozincopter",
            },
        ],
    },
    {
        Artist: "SodaSneb",
        Artists: [
            {
                Artist: "SodaSneb",
                Link: "https://twitter.com/SodaSneb",
            },
        ],
    },
    {
        Artist: "Sturner",
        Artists: [
            {
                Artist: "Sturner",
                Link: "https://twitter.com/Sturnerart",
            },
        ],
    },
    {
        Artist: "Sturner & Hollulu",
        Artists: [
            {
                Artist: "Sturner",
                Link: "https://twitter.com/Sturnerart",
            },
            {
                Artist: "Hollulu",
                Link: "https://twitter.com/meekcheep",
            },
        ],
    },
    {
        Artist: "Tree",
        Artists: [
            {
                Artist: "Tree",
                Link: "https://twitter.com/subwaymayofan",
            },
        ],
    },
    {
        Artist: "WiseSeaMonster",
        Artists: [
            {
                Artist: "WiseSeaMonster",
                Link: "https://twitter.com/WiseSeaMonster_",
            },
        ],
    },
];
for (const artist of artists) {
    try {
        await db.collection("cards").updateMany({
            Artist: artist.Artist
        }, {
            $set: {
                Artists: artist.Artists,
            },
        });
    }
    catch (error) {
        console.log(error);
    }
}
