import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { RequiredEntityData } from "@mikro-orm/core";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

// For the error
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

// Response typer
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(() => User)
export class UserReslover {
  // Register User

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length < 2) {
      return {
        errors: [{ field: "Username", message: "Username is too short" }],
      };
    }
    if (options.password.length <= 6 || !/[0-9]/.test(options.password)) {
      return {
        errors: [
          {
            field: "Passwor",
            message: "Password is too short or does not contain a number",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    } as RequiredEntityData<User>);
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exists")) {
        // Return Duplicate error
        return {
          errors: [{ field: "Username", message: "Username already exists" }],
        };
      }
      console.log("Message:", error.message);
    }
    return {
      user,
    };
  }

  // Login
  @Mutation(() => UserResponse)
  async loginUser(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username does not exist",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, options.password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password",
          },
        ],
      };
    }
    req.session.userId = user.id;
    return {
      user,
    };
  }

  // User Detail
  @Query(() => UserResponse)
  async getUser(@Ctx() { em, req }: MyContext): Promise<UserResponse> {
    console.log("Cookie", req.session);
    if (!req.session.userId) {
      return {
        errors: [{ field: "User", message: "You are not logged in" }],
      };
    }
    const user = await em.findOne(User, { id: req.session.userId });
    if (!user) {
      return {
        errors: [
          {
            field: "User",
            message: "User does not exist",
          },
        ],
      };
    }
    return {
      user: user,
    };
  }
}
