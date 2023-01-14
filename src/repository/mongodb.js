const client = require("../config/database/mongodb");

/**
 * This function will find a document in the database.
 * @param databaseDefault - This is the default database connection that you have set up in your
 * config/database.js file.
 * @param inputDTO - The input data transfer object.
 */
const find = async (databaseDefault, inputDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);
  const result = await collection.find({}).sort({ _id: -1 }).limit(inputDTO.limit).skip(inputDTO.skip).toArray();
  return result;
};
/**
 * This function will find one record in the database that matches the inputDTO.
 * @param databaseDefault - This is the default database connection that you have set up in your
 * config/database.js file.
 * @param inputDTO - The input data transfer object.
 */
const findOne = async (databaseDefault, inputDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);
  const result = await collection.findOne(inputDTO);
  if (!result) {
    return { status_code: 1, message: `${databaseDefault.collectionName} not found` };
  }
  return result;
};
/**
 * It finds one document in the database, and if it doesn't exist, it creates it.
 * @param databaseDefault - The database you want to use.
 * @param inputFindOneDTO - This is the input object that will be used to find the document.
 * @param inputCreateDTO - The object that will be created if the findOneAndCreate() method doesn't
 * find anything.
 */
const findOneAndCreate = async (databaseDefault, inputFindOneDTO, inputCreateDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);
  const result = await collection.findOne(inputFindOneDTO);
  if (!result) {
    const resCreate = await create(databaseDefault, inputCreateDTO);
    if (!resCreate.insertedId) {
      return { status_code: 1, message: `${databaseDefault.collectionName} create failure` };
    }
    return { _id: resCreate.insertedId };
  }
  return result;
};
/**
 * This function creates a new databaseDefault in the database.
 * @param databaseDefault - This is the default database connection that you created in the previous
 * step.
 * @param inputDTO - The input data transfer object.
 */
const create = async (databaseDefault, inputDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);
  const result = await collection.insertOne(inputDTO);
  if (!result.insertedId) {
    return { status_code: 1, message: `${databaseDefault.collectionName} create failure` };
  }
  return result;
};
/**
 * This function updates a record in the database.
 * @param databaseDefault - This is the database object that is passed in from the controller.
 * @param inputId - The id of the record you want to update.
 * @param inputDTO - The input data transfer object.
 */
const update = async (databaseDefault, inputDTO, inputEditDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);

  const filter = inputDTO;
  const options = { upsert: false };
  const updateDoc = { $set: inputEditDTO };
  const result = await collection.updateOne(filter, updateDoc, options);
  if (result.matchedCount === 0) {
    return { status_code: 1, message: `${databaseDefault.collectionName} update failure` };
  }
  return result;
};
/**
 * This function removes a document from the database.
 * @param databaseDefault - This is the database object that you created in the previous step.
 * @param inputId - The id of the item to be removed.
 */
const remove = async (databaseDefault, inputDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);

  const filter = inputDTO;
  const result = await collection.deleteOne(filter);
  if (result.deletedCount === 0) {
    return { status_code: 1, message: `${databaseDefault.collectionName} remove failure` };
  }
  return result;
};
/**
 * It returns a MongoDB aggregation pipeline that can be used to find documents in a collection.
 * @param databaseDefault - The database name
 * @param inputSkipLimitDTO - {
 * @param inputDTO - This is the inputDTO that you pass to the find function.
 */
const findAggregatePipeline = async (databaseDefault, inputSkipLimitDTO, inputDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);

  let pipelineArray = [];
  const pipelineSortSkipLimit = [
    { $sort: { _id: -1 } },
    { $skip: inputSkipLimitDTO.skip },
    { $limit: inputSkipLimitDTO.limit },
  ];
  for (const element of inputDTO) {
    const lookupArray = [
      {
        $lookup: {
          from: element.lookupFrom,
          localField: element.lookupLocalField,
          foreignField: element.lookupForeignField,
          as: element.lookupAs,
        },
      },
      { $unwind: element.lookupUnWind },
    ];
    pipelineArray.push(...lookupArray);
  }
  const pipeline = [...pipelineSortSkipLimit, ...pipelineArray];
  const result = await collection.aggregate(pipeline).toArray();
  return result;
};
/**
 * It returns a single document from the database.
 * @param databaseDefault - The database name
 * @param inputId - The id of the document you want to find.
 * @param inputDTO - The input DTO that was passed into the findOne function.
 */
const findOneAggregatePipeline = async (databaseDefault, inputId, inputDTO) => {
  const database = client.db(databaseDefault.dbName);
  const collection = database.collection(databaseDefault.collectionName);

  let pipelineArray = [];
  const pipelineMatch = [{ $match: { _id: inputId._id } }];
  for (const element of inputDTO) {
    const lookupArray = [
      {
        $lookup: {
          from: element.lookupFrom,
          localField: element.lookupLocalField,
          foreignField: element.lookupForeignField,
          as: element.lookupAs,
        },
      },
      { $unwind: element.lookupUnWind },
    ];
    pipelineArray.push(...lookupArray);
  }
  const pipeline = [...pipelineMatch, ...pipelineArray];
  const result = await collection.aggregate(pipeline).toArray();
  if (!result[0]) {
    return { status_code: 1, message: `${databaseDefault.collectionName} not found` };
  }
  return result[0];
};

module.exports = {
  find,
  findOne,
  findOneAndCreate,
  create,
  update,
  remove,
  findAggregatePipeline,
  findOneAggregatePipeline,
};
