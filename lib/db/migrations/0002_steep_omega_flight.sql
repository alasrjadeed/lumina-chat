CREATE TABLE IF NOT EXISTS "EmailMessage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"threadId" uuid NOT NULL,
	"from" varchar(320),
	"to" varchar(320),
	"subject" text,
	"body" text,
	"direction" varchar DEFAULT 'inbound' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "EmailThread" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" varchar(320),
	"subject" text NOT NULL,
	"lastMessageAt" timestamp DEFAULT now() NOT NULL,
	"unread" boolean DEFAULT true NOT NULL,
	"leadId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_threadId_EmailThread_id_fk" FOREIGN KEY ("threadId") REFERENCES "public"."EmailThread"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EmailThread" ADD CONSTRAINT "EmailThread_leadId_Lead_id_fk" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
