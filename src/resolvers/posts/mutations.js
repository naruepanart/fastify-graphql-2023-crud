const posts_services = require("./posts_services");

const postsMutations = {
  createPosts: async (_, args) => {
    const { input } = args;
    const result = await posts_services.create(input);
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully inserted";
  },
  updatePosts: async (_, args) => {
    const { input } = args;
    const result = await posts_services.update(input);
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully updated";
  },
  removePosts: async (_, args) => {
    const { input } = args;
    const result = await posts_services.remove(input);
    if (result.status_code === 1) {
      return result.message;
    }
    return "Successfully deleted";
  },
};

module.exports = postsMutations;

/* const postsMutations = {
  createPosts: async (_, args) => {},
};

module.exports = postsMutations;  */
