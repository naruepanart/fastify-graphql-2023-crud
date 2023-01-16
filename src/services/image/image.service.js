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
const findOne = async (input) => {
  const schema = z.object({
    name: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const imageCollection = database.collection("image");

  const result = await imageCollection.findOne(dto);
  if (!result) {
    return { status_code: 1, message: "image not found" };
  }
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
const update = async (input) => {
  const schema = z.object({
    _id: z.string(),
    name: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const imageCollection = database.collection("image");

  const filter = { _id: new ObjectId(dto._id) };
  const options = { upsert: false };
  const updateDoc = {
    $set: {
      name: dto.name,
    },
  };
  const result = await imageCollection.updateOne(filter, updateDoc, options);
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
  const imageCollection = database.collection("image");

  const filter = { _id: new ObjectId(dto._id) };
  const result = await imageCollection.deleteOne(filter);
  if (result.deletedCount === 0) {
    return { status_code: 1, message: "remove failure" };
  }
  return result;
};

module.exports = { find, findOne, create, update, remove };

const first = async () => {
  const aa = await create([
    {
      id: "tqf79cZ",
      title: "0-6737487379120894",
      url_viewer: "https://ibb.co/tqf79cZ",
      url: "https://i.ibb.co/hB5PSHX/0-6737487379120894.jpg",
      display_url: "https://i.ibb.co/hB5PSHX/0-6737487379120894.jpg",
      width: 640,
      height: 427,
      size: 23048,
      time: 1673816148,
      expiration: 0,
      image:
        '{"filename":"0-6737487379120894.jpg","name":"0-6737487379120894","mime":"image/jpeg","extension":"jpg","url":"https://i.ibb.co/hB5PSHX/0-6737487379120894.jpg"}',
      thumb:
        '{"filename":"0-6737487379120894.jpg","name":"0-6737487379120894","mime":"image/jpeg","extension":"jpg","url":"https://i.ibb.co/tqf79cZ/0-6737487379120894.jpg"}',
      delete_url: "https://ibb.co/tqf79cZ/6a6f78103f8872695689b04dc10e0a9a",
    },
    {
      id: "123tqf79cZ",
      title: "123-6737487379120894",
      url_viewer: "https://ibb.co/tqf79cZ",
      url: "https://i.ibb.co/hB5PSHX/0-6737487379120894.jpg",
      display_url: "https://i.ibb.co/hB5PSHX/0-6737487379120894.jpg",
      width: 640,
      height: 427,
      size: 23048,
      time: 1673816148,
      expiration: 0,
      image:
        '{"filename":"0-6737487379120894.jpg","name":"0-6737487379120894","mime":"image/jpeg","extension":"jpg","url":"https://i.ibb.co/hB5PSHX/0-6737487379120894.jpg"}',
      thumb:
        '{"filename":"0-6737487379120894.jpg","name":"0-6737487379120894","mime":"image/jpeg","extension":"jpg","url":"https://i.ibb.co/tqf79cZ/0-6737487379120894.jpg"}',
      delete_url: "https://ibb.co/tqf79cZ/6a6f78103f8872695689b04dc10e0a9a",
    },
  ]);
  console.log(aa);
};

first();
