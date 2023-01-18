const { ObjectId } = require("mongodb");
const { z } = require("zod");
const client = require("../../config/database/mongodb");

const find = async (input) => {
  const schema = z.object({
    limit: z.number().max(10).default(10),
    skip: z.number().default(0),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const imageCollection = database.collection("image");

  const result = await imageCollection.find().sort({ _id: -1 }).limit(dto.limit).skip(dto.skip).toArray();
  return result;
};
const create = async (input) => {
  const schema = z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url_viewer: z.string(),
      url: z.string(),
      display_url: z.string(),
      width: z.number(),
      height: z.number(),
      size: z.number(),
      time: z.number(),
      expiration: z.number(),
      image: z.string({
        filename: z.string(),
        name: z.string(),
        mime: z.string(),
        extension: z.string(),
        url: z.string(),
      }),
      thumb: z.string({
        filename: z.string(),
        name: z.string(),
        mime: z.string(),
        extension: z.string(),
        url: z.string(),
      }),
      delete_url: z.string(),
    })
  );
  const dto = schema.parse(input);

  const database = client.db("abc");
  const imageCollection = database.collection("image");

  let imagesArray = [];
  for (let index = 0; index < dto.length; index++) {
    imagesArray.push(dto[index]);
  }

  const options = { ordered: true };
  const result = await imageCollection.insertMany(imagesArray, options);
  if (!result.insertedCount) {
    return { status_code: 1, message: "create failure" };
  }
  return result;
};
const remove = async (input) => {
  const schema = z.object({
    _id: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const imageCollection = database.collection("image");

  const filter = { _id: new ObjectId(dto._id) };
  const result = await imageCollection.deleteOne(filter);
  if (result.deletedCount === 0) {
    return { status_code: 1, message: "remove failure" };
  }
  return result;
};

module.exports = { find, create, remove };
