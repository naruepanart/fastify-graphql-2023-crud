const { ObjectId } = require("mongodb");
const { z } = require("zod");
const mongoDBHooks = require("../../hooks/mongodb");

const find = async (input) => {
  const schema = z.object({
    limit: z.number().max(10).default(10),
    skip: z.number().default(0),
  });
  const dto = schema.parse(input);

  const databaseDefault = {
    dbName: "abc",
    collectionName: "posts",
  };
  const inputSkipLimitDTO = {
    sort: { _id: -1 },
    skip: dto.skip,
    limit: dto.limit,
  };
  const inputDTO = [
    {
      lookupFrom: "users",
      lookupLocalField: "users",
      lookupForeignField: "_id",
      lookupAs: "users",
      lookupUnWind: "$users",
    },
    {
      lookupFrom: "country",
      lookupLocalField: "country",
      lookupForeignField: "_id",
      lookupAs: "country",
      lookupUnWind: "$country",
    },
  ];
  const result = await mongoDBHooks.findAggregatePipeline(databaseDefault, inputSkipLimitDTO, inputDTO);
  return result;
};
const findOne = async (input) => {
  const schema = z.object({
    _id: z.string(),
  });
  const dto = schema.parse(input);

  const databaseDefault = {
    dbName: "abc",
    collectionName: "posts",
  };
  const inputId = {
    _id: new ObjectId(dto._id),
  };
  const inputDTO = [
    {
      lookupFrom: "users",
      lookupLocalField: "users",
      lookupForeignField: "_id",
      lookupAs: "users",
      lookupUnWind: "$users",
    },
    {
      lookupFrom: "country",
      lookupLocalField: "country",
      lookupForeignField: "_id",
      lookupAs: "country",
      lookupUnWind: "$country",
    },
  ];
  const result = await mongoDBHooks.findOneAggregatePipeline(databaseDefault, inputId, inputDTO);
  if (!result) {
    return { status_code: result.status_code, message: result.message };
  }
  return result;
};
const create = async (input) => {
  const schema = z.object({
    users: z.string(),
    title: z.string().trim(),
    body: z.string().trim(),
    country: z.string().trim(),
  });
  const dto = schema.parse(input);

  const countryDatabase = {
    dbName: "abc",
    collectionName: "country",
  };
  const inputCountryDTO = {
    name: dto.country,
  };
  const resCountry = await mongoDBHooks.findOneAndCreate(countryDatabase, inputCountryDTO, inputCountryDTO);
  if (resCountry.status_code === 1) {
    return { status_code: resCountry.status_code, message: resCountry.message };
  }

  const str = {
    ...dto,
    users: new ObjectId(dto.users),
    country: resCountry._id,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const postsDatabase = {
    dbName: "abc",
    collectionName: "posts",
  };
  const result = await mongoDBHooks.create(postsDatabase, str);
  if (result.status_code === 1) {
    return { status_code: result.status_code, message: result.message };
  }
  return result;
};
const update = async (input) => {
  const schema = z.object({
    _id: z.string(),
    users: z.string(),
    title: z.string().trim(),
    body: z.string().trim(),
    country: z.string().trim(),
  });
  const dto = schema.parse(input);

  const countryDatabase = {
    dbName: "abc",
    collectionName: "country",
  };
  const inputCountryDTO = {
    name: dto.country,
  };
  const resCountry = await mongoDBHooks.findOneAndCreate(countryDatabase, inputCountryDTO, inputCountryDTO);
  if (resCountry.status_code === 1) {
    return { status_code: resCountry.status_code, message: resCountry.message };
  }

  const postsDatabase = {
    dbName: "abc",
    collectionName: "posts",
  };
  const inputDTO = { _id: new ObjectId(dto._id), users: new ObjectId(dto.users) };
  const inputEditDTO = {
    title: dto.title,
    body: dto.body,
    country: resCountry._id,
    updated_at: new Date(),
  };
  const result = await mongoDBHooks.update(postsDatabase, inputDTO, inputEditDTO);
  if (result.status_code === 1) {
    return { status_code: result.status_code, message: result.message };
  }
  return result;
};
const remove = async (input) => {
  const schema = z.object({
    _id: z.string(),
    users: z.string(),
  });
  const dto = schema.parse(input);

  const postsDatabase = {
    dbName: "abc",
    collectionName: "posts",
  };
  const inputDTO = { _id: new ObjectId(dto._id), users: new ObjectId(dto.users) };
  const result = await mongoDBHooks.remove(postsDatabase, inputDTO);
  if (result.status_code === 1) {
    return { status_code: result.status_code, message: result.message };
  }
  return result;
};

module.exports = { find, findOne, create, update, remove };
