import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

// Converting the class to type-graphql. Putting the ObjectType means it is both Object type and entity. Also add Field(). If the Field() is not included then that field cannot be queried using graphql
@ObjectType()
@Entity()
export class Post {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "timestamptz" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "timestamptz", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;
}
