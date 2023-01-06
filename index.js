const Fastify = require("fastify");
const mercurius = require("mercurius");
const fs = require("fs");
const usersQuery = require("./src/resolvers/users/query");
const usersMutations = require("./src/resolvers/users/mutations");
const postsMutations = require("./src/resolvers/posts/mutations");
const postsQuery = require("./src/resolvers/posts/query");
const schema = fs.readFileSync("./src/graphql/schema.graphql", "utf8");
const app = Fastify();

const resolvers = {
  Query: {
    ...usersQuery,
    ...postsQuery,
  },
  Mutation: {
    ...usersMutations,
    ...postsMutations,
  },
};

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true,
});

const start = async () => {
  const port = 3000;
  try {
    await app.listen({ port });
    console.log(`http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();

/* module.exports = app; */
