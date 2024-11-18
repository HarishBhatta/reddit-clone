import { User } from "src/entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, Mutation, Query, Resolver } from "type-graphql";
import argon2 from "argon2";

class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@Resolver()
export class userReslover {
  @Mutation()
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    } as any);
    await em.persistAndFlush(user);
  }
}
