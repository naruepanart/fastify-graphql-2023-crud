const { ObjectId } = require("mongodb");
const users_services = require("../users/users_services");
const country_services = require("../country/country_services");
const { z } = require("zod");
const client = require("../../../database/mongodb");

const find = async (input) => {
  const schema = z.object({
    limit: z.number().max(10).default(10),
    skip: z.number().default(0),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const postsCollection = database.collection("posts");

  const result = await postsCollection
    .aggregate()
    .sort({ _id: -1 })
    .skip(dto.skip)
    .limit(dto.limit)
    .lookup({
      from: "users",
      localField: "users",
      foreignField: "_id",
      as: "users",
    })
    .unwind("$users")
    .lookup({
      from: "country",
      localField: "country",
      foreignField: "_id",
      as: "country",
    })
    .unwind("$country")
    .toArray();
  return result;
};
const findOne = async (input) => {
  const schema = z.object({
    _id: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const postsCollection = database.collection("posts");

  const result = await postsCollection
    .aggregate()
    .match({ _id: new ObjectId(dto._id) })
    .lookup({
      from: "users",
      localField: "users",
      foreignField: "_id",
      as: "users",
    })
    .unwind("$users")
    .toArray();
  if (!result[0]) {
    return { status_code: 1, message: "posts not found" };
  }
  return result[0];
};
const create = async (input) => {
  const schema = z.object({
    users: z.string(),
    title: z.string().trim(),
    body: z.string().trim(),
    country: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const postsCollection = database.collection("posts");

  const usersServices = await users_services.findOne({ _id: dto.users });
  if (usersServices.status_code === 1) {
    return { status_code: usersServices.status_code, message: usersServices.message };
  }
  const countryServices = await country_services.findOneAndCreate({ name: dto.country });
  if (countryServices.status_code === 1) {
    return { status_code: countryServices.status_code, message: countryServices.message };
  }

  const str = { ...dto, users: usersServices._id, country: countryServices._id };
  const result = await postsCollection.insertOne(str);
  if (!result.insertedId) {
    return { status_code: 1, message: "create failure" };
  }
  return result;
};
const update = async (input) => {
  const schema = z.object({
    _id: z.string(),
    users: z.string(),
    title: z.string().trim(),
    body: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const postsCollection = database.collection("posts");

  const usersServices = await users_services.findOne({ _id: dto.users });
  if (usersServices.status_code === 1) {
    return { status_code: usersServices.status_code, message: usersServices.message };
  }

  const filter = { _id: new ObjectId(dto._id), users: usersServices._id };
  const options = { upsert: false };
  const updateDoc = {
    $set: {
      title: dto.title,
      body: dto.body,
    },
  };
  const result = await postsCollection.updateOne(filter, updateDoc, options);
  if (result.matchedCount === 0) {
    return { status_code: 1, message: "update failure" };
  }
  return result;
};
const remove = async (input) => {
  const schema = z.object({
    _id: z.string(),
    users: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const postsCollection = database.collection("posts");

  const usersServices = await users_services.findOne({ _id: dto.users });
  if (usersServices.status_code === 1) {
    return { status_code: usersServices.status_code, message: usersServices.message };
  }

  const filter = { _id: new ObjectId(dto._id), users: usersServices._id };
  const result = await postsCollection.deleteOne(filter);
  if (result.deletedCount === 0) {
    return { status_code: 1, message: "remove failure" };
  }
  return result;
};

module.exports = { find, findOne, create, update, remove };

/* const find = (body) => {
  return posts_services.find(body);
};
const findOne = (body) => {
  return posts_services.findOne(body);
};
const create = (body) => {
  return posts_services.create(body);
};
const update = (body) => {
  return posts_services.update(body);
};
const remove = (body) => {
  return posts_services.remove(body);
}; */

/* async function run() {
  const Tfind = await find({ limit: 5, skip: 0 });
  const TfindOne = await findOne({ _id: "63b882d3c2de7ad8eadc2968" });
  const Tcreate = await create({
    users: "63b8414e0276c377c1c7df1c",
    title: Math.random().toString(),
    body: Math.random().toString(),
  });
  const Tupdate = await update({
    _id: "63b85ed68ced1f94e29c9259",
    title: "updated 10",
    body: "updated 20",
    users: "63b8414e0276c377c1c7df1c",
  });
  const Tremove = await remove({
    _id: "63b85ee7dd1aa8206e9f73ff",
    users: "63b8414e0276c377c1c7df1c",
  });
  console.log(Tremove);
}
run(); */
