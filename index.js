require("dotenv").config();
const Fastify = require("fastify");
const path = require("path");
const cors = require("@fastify/cors");
const mercurius = require("mercurius");
const mercuriusAuth = require("mercurius-auth");
const { verifyPaseto } = require("./src/modules/auth/auth.service");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { loadFilesSync } = require("@graphql-tools/load-files");
const schema = makeExecutableSchema({
  typeDefs: loadFilesSync(path.join(__dirname, "./src/modules/**/*.graphql")),
  resolvers: loadFilesSync(path.join(__dirname, "./src/modules/**/*.resolver.{js,ts}")),
});

const app = Fastify();
app.register(cors);
app.register(mercurius, {
  schema,
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
      const decrypt = await verifyPaseto({ atk, def });
      context.auth.users = decrypt;
      return decrypt;
    }
  },
  authDirective: "auth",
});

const start = async () => {
  const port = process.env.PORT || 3000;
  const NODE_ENV = process.env.NODE_ENV || "development";
  try {
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`http://localhost:${port}-${NODE_ENV}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();

/* module.exports = app; */
