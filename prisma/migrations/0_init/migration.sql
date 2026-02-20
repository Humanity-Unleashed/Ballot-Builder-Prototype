-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."analytics_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "screen" TEXT NOT NULL,
    "screen_name" TEXT NOT NULL,
    "properties" JSONB NOT NULL DEFAULT '{}',
    "referrer" TEXT,
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedback_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "screen" TEXT NOT NULL,
    "screen_name" TEXT NOT NULL,
    "type" TEXT,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_created_at_idx" ON "public"."analytics_events"("created_at" ASC);

-- CreateIndex
CREATE INDEX "analytics_events_event_type_idx" ON "public"."analytics_events"("event_type" ASC);

-- CreateIndex
CREATE INDEX "analytics_events_session_id_idx" ON "public"."analytics_events"("session_id" ASC);

