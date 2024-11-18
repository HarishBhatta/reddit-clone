import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {
  @PrimaryKey()
  id!: number;

  @Property({ type: "timestamptz" })
  createdAt = new Date();

  @Property({ type: "timestamptz", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: "text" })
  title!: string;
}
