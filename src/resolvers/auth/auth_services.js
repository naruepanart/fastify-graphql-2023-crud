const { ObjectId } = require("mongodb");
const { z } = require("zod");
const client = require("../../../database/mongodb");
const argon2 = require("argon2");
const crypto = require("crypto");
const { V4 } = require("paseto");

const hashingConfig = {
  parallelism: 1,
  memoryCost: 2048,
  timeCost: 3,
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(32);
  return argon2.hash(password, {
    ...hashingConfig,
    salt,
  });
};

const comparePasswords = async (password, hash) => {
  const result = await argon2.verify(hash, password, hashingConfig);
  if (!result) {
    return { status_code: 1, message: "password not match" };
  }
  return result;
};

const verifyPaseto = async (input) => {
  const schema = z.object({
    atk: z.string(),
    def: z.string(),
  });
  const dto = schema.parse(input);
  const decrypt = await V4.verify(`v4.public.${dto.atk}`, `k4.public.${dto.def}`, {
    audience: "lessfoto1.com",
    issuer: "api.lessfoto1.com",
  });
  return decrypt;
};

const register = async (input) => {
  const schema = z
    .object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "password not match",
      path: ["password"],
    });
  const dto = schema.parse(input);

  /* Checking if the email exists in the database. */
  const isUserInfo = await findOne({ email: dto.email });
  if (isUserInfo._id) {
    return "email is exists";
  }

  const str = {
    name: dto.name,
    email: dto.email,
    password: await hashPassword(dto.password),
    is_admin: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const resCreate = await create(str);
  if (resCreate.status_code === 1) {
    return resCreate.message;
  }

  return resCreate;
};

const login = async (input) => {
  const schema = z.object({
    email: z.string(),
    password: z.string(),
    role: z.boolean().default(false),
  });
  const dto = schema.parse(input);
  /* Checking if the email exists in the database. */
  const isUserInfo = await findOne({ email: dto.email });
  if (isUserInfo.status_code === 1) {
    return isUserInfo.message;
  }
  /* Comparing the password that the user entered with the password in the database. */
  const isPassword = await comparePasswords(dto.password, isUserInfo.password);
  if (isPassword.status_code === 1) {
    return isPassword.message;
  }
  /* Generating a public key and a secret key. */
  const { publicKey, secretKey } = await V4.generateKey("public", {
    format: "paserk",
  });
  const payload = {
    _id: isUserInfo._id.toString(),
    name: isUserInfo.name,
    role: isUserInfo.role,
  };
  /* Generating a token. */
  const token = await V4.sign(payload, secretKey, {
    audience: "lessfoto1.com",
    issuer: "api.lessfoto1.com",
    expiresIn: "1y",
  });
  return {
    atk: token.split(".")[2],
    def: publicKey.split(".")[2],
  };
};

const find = async (input) => {
  const schema = z.object({
    limit: z.number().max(10).default(10),
    skip: z.number().default(0),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const usersCollection = database.collection("users");

  const result = await usersCollection.find().sort({ _id: -1 }).limit(dto.limit).skip(dto.skip).toArray();
  return result;
};
const findOne = async (input) => {
  const schema = z.object({
    email: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const usersCollection = database.collection("users");

  const result = await usersCollection.findOne(dto);
  if (!result) {
    return { status_code: 1, message: "users not found" };
  }
  return result;
};
const findOneAndCreate = async (input) => {
  const schema = z.object({
    email: z.string(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const usersCollection = database.collection("users");

  /* Checking if the users exists in the database. If it does not exist, it will create it. */
  const result = await usersCollection.findOne(dto);
  if (!result) {
    const res = await create(dto);
    return { _id: res.insertedId };
  }
  return result;
};
const create = async (input) => {
  const schema = z.object({
    name: z.string().trim(),
    email: z.string().email(),
    password: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const usersCollection = database.collection("users");

  const result = await usersCollection.insertOne(dto);
  if (!result.insertedId) {
    return { status_code: 1, message: "create failure" };
  }
  return result;
};
const update = async (input) => {
  const schema = z.object({
    _id: z.string(),
    email: z.string().trim(),
  });
  const dto = schema.parse(input);

  const database = client.db("abc");
  const usersCollection = database.collection("users");

  const filter = { _id: new ObjectId(dto._id) };
  const options = { upsert: false };
  const updateDoc = {
    $set: {
      email: dto.email,
    },
  };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
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
  const usersCollection = database.collection("users");

  const filter = { _id: new ObjectId(dto._id) };
  const result = await usersCollection.deleteOne(filter);
  if (result.deletedCount === 0) {
    return { status_code: 1, message: "remove failure" };
  }
  return result;
};

module.exports = { verifyPaseto, login, find, findOne, findOneAndCreate, create, update, remove };

/* const first = async () => {
  const Tcreate = await verifyPaseto({
    atk:
      "eyJfaWQiOiI2M2I4YzQ1YjdkNWUwZmNiNzYzOTZjZjIiLCJyb2xlIjpmYWxzZSwiaWF0IjoiMjAyMy0wMS0wN1QwMToyNToxMi4wNTFaIiwiZXhwIjoiMjAyNC0wMS0wN1QwNzoyNToxMi4wNTFaIiwiYXVkIjoibGVzc2ZvdG8uY29tIiwiaXNzIjoiYXBpLmxlc3Nmb3RvLmNvbSJ91NqRRuP-TerVlagSNWnJm5KyIg45A63UFSFjgE6Mvdt9sDnmfkXPXLFmUS3qtxmIDUiVIm-CUmaCBMh0dKPwAA",
    def: "s4XiMx0BDZuUnRM_iSvD9vevbPjk899jH_soZcRvm1A",
  });
  console.log(Tcreate);
}; */
/* const first = async () => {
  const Tcreate = await login({
    email: "abc@gmail.com",
    password: "123456",
  });
  console.log(Tcreate);
};
first(); */
/* const first = async () => {
  const Tcreate = await register({
    name: "Alice",
    email: "abc@gmail.com",
    password: "123456",
    confirm_password: "123456",
  });
  console.log(Tcreate);
};

first(); */
