const Fastify = require("fastify");
const mercurius = require("mercurius");
const fs = require("fs");
const mercuriusAuth = require("mercurius-auth");
const usersQuery = require("./src/resolvers/users/query");
const usersMutations = require("./src/resolvers/users/mutations");
const postsMutations = require("./src/resolvers/posts/mutations");
const postsQuery = require("./src/resolvers/posts/query");
const auth_services = require("./src/resolvers/auth/auth_services");
const authMutations = require("./src/resolvers/auth/mutations");
const typeDefs = fs.readFileSync("./src/graphql/schema.graphql", "utf8");
const app = Fastify();

const resolvers = {
  Query: {
    ...usersQuery,
    ...postsQuery,
  },
  Mutation: {
    ...authMutations,
    ...usersMutations,
    ...postsMutations,
  },
};

app.register(mercurius, {
  schema: typeDefs,
  resolvers,
  graphiql: true,
});

app.register(mercuriusAuth, {
  authContext(context) {
    return {
      atk: context.reply.request.headers["atk"],
      def: context.reply.request.headers["def"],
    };
  },
  async applyPolicy(authDirectiveAST, parent, args, context, info) {
    const atk = context.auth.atk;
    const def = context.auth.def;
    if (atk && def) {
      const decrypt = await auth_services.verifyPaseto({ atk, def });
      context.auth.users = decrypt;
      return decrypt;
    }
  },
  authDirective: "auth",
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
