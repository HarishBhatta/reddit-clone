import { Migration } from '@mikro-orm/migrations';

export class Migration20241117181815 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "post" alter column "created_at" type timestamptz using ("created_at"::timestamptz);`);
    this.addSql(`alter table "post" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "post" alter column "created_at" type date using ("created_at"::date);`);
    this.addSql(`alter table "post" alter column "updated_at" type date using ("updated_at"::date);`);
  }

}
