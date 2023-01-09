const authService = require("./auth.service");

module.exports = {
  Mutation: {
    register: async (_, args) => {
      const { input } = args;
      const result = await authService.register(input);
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully register";
    },
    login: async (_, args) => {
      const { input } = args;
      const result = await authService.login(input);
      if (result.status_code === 1) {
        return result.message;
      }
      return result;
    },
  },
};
