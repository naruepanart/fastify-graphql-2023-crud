const auth_services = require("./auth_services");

const authMutations = {
  register: async (_, args) => {
    const { input } = args;
    const result = await auth_services.register(input);
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
  login: async (_, args) => {
    const { input } = args;
    const result = await auth_services.login(input);
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
};

module.exports = authMutations;
