const posts_services = require("./posts_services");

const postsMutations = {
  createPosts: async (_, args, context) => {
    const { input } = args;
    const users_id = context.auth.users._id;
    const dto = { ...input, users: users_id };
    const result = await posts_services.create(dto);
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully inserted";
  },
  updatePosts: async (_, args, context) => {
    const { input } = args;
    const users_id = context.auth.users._id;
    const dto = { ...input, users: users_id };
    const result = await posts_services.update(dto);
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully updated";
  },
  removePosts: async (_, args, context) => {
    const { input } = args;
    const users_id = context.auth.users._id;
    const dto = { ...input, users: users_id };
    const result = await posts_services.remove(dto);
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully deleted";
  },
};

module.exports = postsMutations;
