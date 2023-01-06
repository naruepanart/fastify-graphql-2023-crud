const users_services = require("./users_services");

const usersMutations = {
  createUsers: async (_, args) => {
    const { input } = args;
    const { name } = input;

    const result = await users_services.create({ name });
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully inserted";
  },
  updateUsers: async (_, args) => {
    const { input } = args;
    const { _id, name } = input;

    const result = await users_services.update({ _id, name });
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully updated";
  },
  removeUsers: async (_, args) => {
    const { input } = args;
    const { _id } = input;

    const result = await users_services.remove({ _id });
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully deleted";
  },
};

module.exports = usersMutations;

/* const usersMutations = {
  createUsers: async (_, args) => {},
};

module.exports = usersMutations;  */
