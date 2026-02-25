-- CreateTable
CREATE TABLE "ballot_cache" (
    "id" TEXT NOT NULL,
    "district_hash" TEXT NOT NULL,
    "election_date" TEXT NOT NULL,
    "raw_ballot" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ballot_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voter_info_cache" (
    "id" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voter_info_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zipcode_lookups" (
    "id" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "county" TEXT,
    "city" TEXT,
    "ocd_division_ids" JSONB NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "district_hash" TEXT NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zipcode_lookups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ballot_cache_district_hash_idx" ON "ballot_cache"("district_hash");

-- CreateIndex
CREATE UNIQUE INDEX "ballot_cache_district_hash_election_date_key" ON "ballot_cache"("district_hash", "election_date");

-- CreateIndex
CREATE UNIQUE INDEX "voter_info_cache_state_code_key" ON "voter_info_cache"("state_code");

-- CreateIndex
CREATE UNIQUE INDEX "zipcode_lookups_zipcode_key" ON "zipcode_lookups"("zipcode");
