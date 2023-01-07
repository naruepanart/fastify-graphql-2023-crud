const users_services = require("./users_services");

const usersQuery = {
  me: async (_, args, context) => {
    const users_id = context.auth.users._id;
    const dto = { _id: users_id };

    const result = await users_services.findOne(dto);
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
  users: async (_, args) => {
    const { input } = args;
    const { page = 1, limit = 10 } = input;
    const skip = (page - 1) * limit;

    const result = await users_services.find({ limit, skip });
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
  user: async (_, args) => {
    const { input } = args;
    const { _id } = input;

    const result = await users_services.findOne({ _id });
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
};

module.exports = usersQuery;
