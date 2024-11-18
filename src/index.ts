import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import { Post } from "./entities/Post";
import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  const em = orm.em.fork();

  // Need to run the npx mikro-orm migration:create --run to do automatic migration without using the cli
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app } as any);
  app.listen(4000, () => {
    console.log("Server started on 4004");
  });
};

main()
  .then(() => console.log("Successful Connection"))
  .catch((err) => console.log(err));