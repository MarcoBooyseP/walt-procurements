CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requestedBy" text NOT NULL,
	"farmLocation" text NOT NULL,
	"category" text NOT NULL,
	"itemDetails" text NOT NULL,
	"urgency" text DEFAULT 'Low' NOT NULL,
	"fileUrls" jsonb,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
