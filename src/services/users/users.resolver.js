const usersService = require("./users.service");

module.exports = {
  Query: {
    me: async (_, args, context) => {
      const users_id = context.auth.users.users;
      const dto = { _id: users_id };

      const result = await usersService.findOne(dto);
      if (result.status_code === 1) {
        return result.message;
      }
      return result;
    },
    users: async (_, args) => {
      const { input } = args;
      const { page = 1, limit = 10 } = input;
      const skip = (page - 1) * limit;

      const result = await usersService.find({ limit, skip });
      if (result.status_code === 1) {
        return result.message;
      }
      return result;
    },
    user: async (_, args) => {
      const { input } = args;
      const { _id } = input;

      const result = await usersService.findOne({ _id });
      if (result.status_code === 1) {
        return result.message;
      }
      return result;
    },
  },
  Mutation: {
    createUsers: async (_, args) => {
      const { input } = args;
      const { name } = input;

      const result = await usersService.create({ name });
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully inserted";
    },
    updateUsers: async (_, args) => {
      const { input } = args;
      const { _id, name } = input;

      const result = await usersService.update({ _id, name });
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully updated";
    },
    removeUsers: async (_, args) => {
      const { input } = args;
      const { _id } = input;

      const result = await usersService.remove({ _id });
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully deleted";
    },
  },
};
