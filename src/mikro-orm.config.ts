import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
export default {
  migrations: {
    path: path.join(__dirname, "./migrations"), // path to the folder with migrations
    pathTs: "src/migrations",
    glob: "!(*.d).{js,ts}",
  },
  entities: [Post],
  dbName: "reddit",
  driver: PostgreSqlDriver,
  debug: !__prod__,
  password: "password",
} as Parameters<typeof MikroORM.init>[0];
