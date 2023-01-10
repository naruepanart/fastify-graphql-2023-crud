const postsService = require("./posts.service");

module.exports = {
  Query: {
    posts: async (_, args) => {
      const { input } = args;
      const { page = 1, limit = 10 } = input;
      const skip = (page - 1) * limit;

      const result = await postsService.find({ limit, skip });
      if (result.status_code === 1) {
        return result.message;
      }
      return result;
    },
    post: async (_, args) => {
      const { input } = args;
      const { _id } = input;

      const result = await postsService.findOne({ _id });
      if (result.status_code === 1) {
        return result.message;
      }
      return result;
    },
  },
  Mutation: {
    createPosts: async (_, args, context) => {
      const { input } = args;
      const users_id = context.auth.users._id;
      const dto = { ...input, users: users_id };
      const result = await postsService.create(dto);
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully inserted";
    },
    updatePosts: async (_, args, context) => {
      const { input } = args;
      const users_id = context.auth.users._id;
      const dto = { ...input, users: users_id };
      const result = await postsService.update(dto);
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully updated";
    },
    removePosts: async (_, args, context) => {
      const { input } = args;
      const users_id = context.auth.users._id;
      const dto = { ...input, users: users_id };
      const result = await postsService.remove(dto);
      if (result.status_code === 1) {
        return result.message;
      }
      return "Successfully deleted";
    },
  },
};
