const { ObjectId } = require("mongodb");
const { z } = require("zod");
const client = require("../../../database/mongodb");

const find = async (input) => {
  const schema = z.object({
    limit: z.number().max(10).default(10),
    skip: z.number().default(0),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const countryCollection = database.collection("country");

  const result = await countryCollection.find().sort({ _id: -1 }).limit(dto.limit).skip(dto.skip).toArray();
  return result;
};
const findOne = async (input) => {
  const schema = z.object({
    name: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const countryCollection = database.collection("country");

  const result = await countryCollection.findOne(dto);
  if (!result) {
    return { status_code: 1, message: "country not found" };
  }
  return result;
};
const findOneAndCreate = async (input) => {
  const schema = z.object({
    name: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const countryCollection = database.collection("country");

  /* Checking if the country exists in the database. If it does not exist, it will create it. */
  const result = await countryCollection.findOne(dto);
  if (!result) {
    const res = await create(dto);
    return { _id: res.insertedId };
  }
  return result;
};
const create = async (input) => {
  const schema = z.object({
    name: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const countryCollection = database.collection("country");

  const result = await countryCollection.insertOne(dto);
  if (!result.insertedId) {
    return { status_code: 1, message: "create failure" };
  }
  return result;
};
const update = async (input) => {
  const schema = z.object({
    _id: z.string(),
    name: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const countryCollection = database.collection("country");

  const filter = { _id: new ObjectId(dto._id) };
  const options = { upsert: false };
  const updateDoc = {
    $set: {
      name: dto.name,
    },
  };
  const result = await countryCollection.updateOne(filter, updateDoc, options);
  if (result.matchedCount === 0) {
    return { status_code: 1, message: "update failure" };
  }
  return result;
};
const remove = async (input) => {
  const schema = z.object({
    _id: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const countryCollection = database.collection("country");

  const filter = { _id: new ObjectId(dto._id) };
  const result = await countryCollection.deleteOne(filter);
  if (result.deletedCount === 0) {
    return { status_code: 1, message: "remove failure" };
  }
  return result;
};

module.exports = { find, findOne, findOneAndCreate, create, update, remove };

/* const first = async () => {
  const Tcreate = await remove({ _id: "63b88e9865bc3cabeafcb1d3" });
  console.log(Tcreate);
};

first(); */
