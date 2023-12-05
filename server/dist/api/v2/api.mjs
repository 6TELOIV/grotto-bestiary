import { Router } from 'express';
import gql from "graphql-tag";
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { expressMiddleware } from '@apollo/server/express4';
import resolvers from "./resolvers/index.mjs";
import { readFileSync } from "fs";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
// for getting static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();
const schemas = [
    'index',
    'card',
    'user'
];
const typeDefs = schemas.map(s => gql(readFileSync(path.resolve(__dirname, `./schema/${s}.graphql`), {
    encoding: "utf-8",
})));
const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    introspection: true,
});
await server.start();
router.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
        return {
            session: req.session
        };
    }
}));
export { router };
