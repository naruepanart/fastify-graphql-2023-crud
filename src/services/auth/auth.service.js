const { z } = require("zod");
const argon2 = require("argon2");
const crypto = require("crypto");
const { V4 } = require("paseto");
const mongoDBHooks = require("../../hooks/mongodb");
const { ObjectId } = require("mongodb");

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
  /* A validation of the input data. */
  const inputSchema = z
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
  const dto = inputSchema.parse(input);

  /* Checking if the email exists in the database. */
  const databaseDefault = {
    dbName: "abc",
    collectionName: "users",
  };
  const inputDTO = {
    email: dto.email,
  };
  const isUserInfo = await mongoDBHooks.findOne(databaseDefault, inputDTO);
  if (isUserInfo._id) {
    return { status_code: 1, message: "email is exists" };
  }

  /* Creating a new user. */
  const databaseDefault2 = {
    dbName: "abc",
    collectionName: "users",
  };
  const inputDTO2 = {
    name: dto.name,
    email: dto.email,
    password: await hashPassword(dto.password),
    is_admin: false,
    created_at: new Date(),
    updated_at: new Date(),
  };
  const resCreate = await mongoDBHooks.create(databaseDefault2, inputDTO2);
  if (resCreate.status_code === 1) {
    return { status_code: 1, message: resCreate.message };
  }
  return resCreate;
};

const login = async (input) => {
  const schema = z.object({
    email: z.string(),
    password: z.string(),
  });
  const dto = schema.parse(input);

  const databaseDefault = {
    dbName: "abc",
    collectionName: "users",
  };
  const inputDTO = {
    email: dto.email,
  };
  /* Checking if the email exists in the database. */
  const isUserInfo = await mongoDBHooks.findOne(databaseDefault, inputDTO);
  if (isUserInfo.status_code === 1) {
    return { status_code: 1, message: isUserInfo.message };
  }

  /* Comparing the password that the user entered with the password in the database. */
  const isPassword = await comparePasswords(dto.password, isUserInfo.password);
  if (isPassword.status_code === 1) {
    return { status_code: 1, message: isPassword.message };
  }

  /* Checking if the user has already logged in from the same IP address. If not, it will create a new
 record. */
  const geolocationDB = {
    dbName: "abc",
    collectionName: "geolocation",
  };
  const inputGeoLocationFindOne = {
    users: new ObjectId(isUserInfo._id),
    IPv4: "1.20.43.163",
  };
  const payloadGeoLocation = {
    users: new ObjectId(isUserInfo._id),
    // from UI
    country_code: "TH",
    country_name: "Thailand",
    city: "Chon Buri",
    postal: "20000",
    latitude: 13.1604,
    longitude: 101.1083,
    IPv4: "1.20.43.163",
    state: "Changwat Chon Buri",
  };
  const resGeoLocation = await mongoDBHooks.findOneAndCreate(
    geolocationDB,
    inputGeoLocationFindOne,
    payloadGeoLocation
  );
  if (resGeoLocation.status_code === 1) {
    return { status_code: resGeoLocation.status_code, message: resGeoLocation.message };
  }

  /* Creating a session. */
  const sessiondDB = {
    dbName: "abc",
    collectionName: "session",
  };
  const inputSessionFindOne = {
    users: new ObjectId(isUserInfo._id),
    geolocation: new ObjectId(resGeoLocation._id),
  };
  const inputSessionCreate = {
    users: new ObjectId(isUserInfo._id),
    geolocation: new ObjectId(resGeoLocation._id),
    created_at: new Date(),
  };
  const resSession = await mongoDBHooks.findOneAndCreate(sessiondDB, inputSessionFindOne, inputSessionCreate);
  if (resSession.status_code === 1) {
    return { status_code: resSession.status_code, message: resSession.message };
  }

  /* Creating a token. */
  const { publicKey, secretKey } = await V4.generateKey("public", {
    format: "paserk",
  });
  const payload = {
    users: isUserInfo._id.toString(),
    session: resSession._id.toString(),
  };
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

const findOneSession = async (input) => {
  const schema = z.object({
    users: z.string(),
  });
  const dto = schema.parse(input);

  const sessiondDB = {
    dbName: "abc",
    collectionName: "session",
  };
  const inputFindOneDTO = {
    users: new ObjectId(dto.users),
  };
  const result = await mongoDBHooks.findOne(sessiondDB, inputFindOneDTO);
  if (result.status_code === 1) {
    return { status_code: result.status_code, message: result.message };
  }
  return result;
};

module.exports = { findOneSession, verifyPaseto, register, login };

/* const runnnn = async () => {
  const input = {
    email: "bba1231@gmail.com",
    password: "123456789",
  };

  const aa = await login(input);
  console.log(aa);
};

runnnn(); */
