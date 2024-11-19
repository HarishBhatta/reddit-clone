import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { UserReslover } from "./resolvers/user";
import { createClient } from "redis";
import session from "express-session";
import RedisStore from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  const em = orm.em.fork();

  // Need to run the npx mikro-orm migration:create --run to do automatic migration without using the cli
  await orm.getMigrator().up();

  const app = express();
  let redisClient = createClient();
  // const redisCliennt = redis.createClient();

  const redisStore = new RedisStore({
    client: redisClient,
    disableTouch: true,
  });

  app.use(
    session({
      name: "qid",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 Years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // The cookie only works on https
      },
      store: redisStore,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: "dsjhfjsdhfkjhdkjshfj",
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserReslover],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({ em, req, res }),
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
