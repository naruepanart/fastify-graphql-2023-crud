const posts_services = require("./posts_services");

const postsQuery = {
  posts: async (_, args) => {
    const { input } = args;
    const { page = 1, limit = 10 } = input;
    const skip = (page - 1) * limit;

    const result = await posts_services.find({ limit, skip });
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
  post: async (_, args) => {
    const { input } = args;
    const { _id } = input;

    const result = await posts_services.findOne({ _id });
    if (result.status_code === 1) {
      return result.message;
    }
    return result;
  },
};

module.exports = postsQuery;
