import { Router } from 'express';
import { db } from '../../db/conn.mjs';
import { buildSchema } from 'graphql';

const router = Router();


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!"
  },
}


export { router };
