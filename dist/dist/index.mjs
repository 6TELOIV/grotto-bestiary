import express, { json, urlencoded, static as serve_static } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import https from 'https';
import { cardNameToCardDetailsURL, cardNameToCardImageURL, } from "./helpers.mjs";
import { mongo_uri, sessionSecret } from "./secrets/secrets.mjs";
import { router as cardRouter } from "./api/cards.mjs";
import { router as accountRouter } from "./api/accounts.mjs";
import { router as decksRouter } from "./api/decks.mjs";
import { router as patchRouter } from "./api/patch-notes.mjs";
import { router as apiV2Router } from "./api/v2/api.mjs";
import { initBot } from "./bot/bot.mjs";
// for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**** Discord Bot Setup ****/
initBot();
/**** WebApp Setup ****/
// create app
const app = express();
/* At the top, with other redirect methods before other routes */
app.get("*", function (req, res, next) {
    if (process.env.NODE_ENV && req.headers["x-forwarded-proto"] != "https")
        res.redirect("https://www.grotto-bestiary.com" + req.url);
    else
        next(); /* Continue to other routes if we're not redirecting */
});
// parse bodys as json
app.use(json());
app.use(urlencoded({ extended: true }));
// Serve static files from the React app
app.use(serve_static(join(__dirname, "client/build")));
// session setup
var sessOpt = {
    secret: sessionSecret,
    cookie: {},
    store: MongoStore.create({
        mongoUrl: mongo_uri,
        dbName: "GrottoBeastsDB",
    }),
};
if (process.env.NODE_ENV) {
    app.set("trust proxy", 1); // trust first proxy
    sessOpt.cookie.secure = true; // serve secure cookies
}
app.use(session(sessOpt));
// api middlewares
app.use("/", cardRouter);
app.use("/", decksRouter);
app.use("/", accountRouter);
app.use("/patch-notes", patchRouter);
app.use("/api", apiV2Router);
// Special cast for card-details to have meta data
app.use("/card-details", (req, res, next) => {
    if (!req.query.cardName) {
        return next();
    }
    fs.readFile(join(__dirname, "client/build/index.html"), "utf8", (err, htmlData) => {
        if (err) {
            console.error("Error during file reading", err);
            return res.status(404).end();
        }
        // inject meta tags
        htmlData = htmlData
            .replace("Violet's Grotto Bestiary", `${req.query.cardName} - Grotto Bestiary`)
            .replace("Searchable Database for the hit 90's game, Grotto Beasts!", "")
            .replace("__META_OG_IMAGE__", cardNameToCardImageURL(req.query.cardName));
        return res.send(htmlData);
    });
});
// For any request that doesn't match one above, send back React's index.html file.
app.use((req, res, next) => {
    return res.sendFile(join(__dirname, "client/build/index.html"));
});
const port = process.env.PORT || 5000;
if (process.env.NODE_ENV === "production") {
    app.listen(port);
}
else {
    https.createServer({ key: fs.readFileSync('./secrets/key.pem'), cert: fs.readFileSync('./secrets/cert.pem') }, app).listen(port);
}
console.log(`Listening on ${port}`);
