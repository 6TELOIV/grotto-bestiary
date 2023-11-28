import { MongoClient, ServerApiVersion } from "mongodb";
import { mongo_uri } from "../secrets/secrets.mjs";
console.log(process.env.MONGO_DB_URI);
const client = new MongoClient(mongo_uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
let conn;
try {
    conn = await client.connect();
}
catch (e) {
    console.error(e);
}
export const db = conn.db("GrottoBeastsDB");
