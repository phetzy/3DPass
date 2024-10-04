CREATE TABLE IF NOT EXISTS "users" (
	"uuid" uuid PRIMARY KEY NOT NULL,
	"id" serial NOT NULL,
	"password" varchar NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" varchar(10),
	"street_address" varchar(100),
	"street_address_two" varchar(100),
	"city" text,
	"zipcode" varchar(5),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "users_id_unique" UNIQUE("id")
);
