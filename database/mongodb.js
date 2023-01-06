const { MongoClient } = require("mongodb");

const MONGODB_CONNECT =
  "mongodb+srv://JtCqGymTW0vlPTIQ:urajvwgRuh89HUOq@cluster0.vnqxc.mongodb.net/abc?retryWrites=true&w=majority";

const client = new MongoClient(MONGODB_CONNECT);

module.exports = client;
