// db.js
import Dexie from 'dexie';

// increment when the DB had new data to force a refresh on users browsers
const dbVersion = "5";

let db;
db = new Dexie('myDatabase');
db.version(1).stores({
    cards: '&_id, Number, Name, Type, Epic, Artist, Power, Goal, Cost, Effect, Fun, Rarity, Notes', // Primary key and indexed props
});

let usingBackup = false;
function backupDatabase() {
    // fallback for when Dexie is not supported
    usingBackup = true;
    db = {
        _cards: [],
        cards: {
            bulkPut: async function (cards) {
                console.log(cards);
                this._cards = cards;
                console.log(this);
            },
            toCollection: function () {
                return {
                    _cards: this._cards,
                    _filters: [],
                    filter: function (filter) {
                        this._filters.push(filter);
                        return this;
                    },
                    toArray: function () {
                        console.log(this._filters);
                        console.log(this._cards);
                        // find cards that match all filters
                        return this._cards.filter((card) => {
                            return this._filters.every((filter) => filter(card));
                        });
                    }
                };
            }
        }
    };
}

export async function init_db() {
    try {
        await db.open();
    } catch {
        backupDatabase();
    }

    const ValidThru = new Date(localStorage.getItem("ValidThru"));
    const hasDBVersion = localStorage.getItem("dbVersion");
    const today = new Date();

    if (ValidThru === null || ValidThru <= today || hasDBVersion !== dbVersion || usingBackup) {
        let response = await fetch(
            "/cards",
            {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: "{}"
            });
        const cards = await response.json();
        console.log(cards);
        await db.cards.bulkPut(cards);
    }
    today.setDate(today.getDate() + 7);
    localStorage.setItem("ValidThru", today.toISOString());
    localStorage.setItem("dbVersion", dbVersion);

    return null;
}

export { db };
