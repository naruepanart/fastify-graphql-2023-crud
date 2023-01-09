const { MongoClient } = require("mongodb");

const MONGODB_CONNECT = process.env.MONGODB_URL;

const client = new MongoClient(MONGODB_CONNECT);

module.exports = client;
