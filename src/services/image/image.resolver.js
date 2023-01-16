const imageService = require("./image.service");

module.exports = {
  Mutation: {
    create: async (_, args, context) => {
      const { input } = args;
      const users = context.auth.users.users;
      const dto = { ...input, users };
      const result = await imageService.create(dto);
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully inserted";
    },
  },
};
