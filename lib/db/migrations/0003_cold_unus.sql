CREATE TABLE IF NOT EXISTS "Account" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"provider" varchar(64) NOT NULL,
	"providerAccountId" varchar(64) NOT NULL,
	"refreshToken" text,
	"accessToken" text,
	"expiresAt" timestamp,
	"tokenType" varchar(64),
	"scope" text,
	"idToken" text,
	"sessionState" text,
	CONSTRAINT "Account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
