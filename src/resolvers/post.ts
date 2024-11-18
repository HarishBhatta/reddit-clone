import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  //Get all Posts
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  //Get Single Post
  @Query(() => Post, { nullable: true }) // This is the graphql type. Return type Post or null. We cannot do Post | null
  post(
    @Arg("id", () => Int) id: number, // We can put anthing instead of "identifier" which will be used when querying the graphql
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  // Create a Post
  @Mutation(() => Post) // Query for getting the data. Mutation for changing, create or delete
  async createPost(
    @Arg("title", () => String) title: string, // The ()=>type is optional. The graphql can infer it
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title } as any);
    await em.persistAndFlush(post);
    return post;
  }

  // Update a Post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    // const post = em.create(Post, { title } as any);
    if (typeof title !== "undefined") {
      post.title = title;
      await em.persistAndFlush(post);
    }
    await em.persistAndFlush(post);
    return post;
  }
}
