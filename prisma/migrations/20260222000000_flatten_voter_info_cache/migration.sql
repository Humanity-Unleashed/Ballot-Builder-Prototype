-- Clear existing cached rows (cache auto-repopulates on next request)
DELETE FROM "voter_info_cache";

-- DropColumn
ALTER TABLE "voter_info_cache" DROP COLUMN "rules";

-- AddColumns
ALTER TABLE "voter_info_cache" ADD COLUMN "state_name" TEXT NOT NULL;
ALTER TABLE "voter_info_cache" ADD COLUMN "registration_deadline_in_person" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "registration_deadline_by_mail" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "registration_deadline_online" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "id_requirements_to_vote" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "id_requirements_to_register" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "absentee_ballot_rules" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "early_voting_starts" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "early_voting_ends" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "election_day_registration" BOOLEAN;
ALTER TABLE "voter_info_cache" ADD COLUMN "automatic_voter_registration" BOOLEAN;
ALTER TABLE "voter_info_cache" ADD COLUMN "voter_registration_url" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "absentee_ballot_url" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "election_information_url" TEXT;
ALTER TABLE "voter_info_cache" ADD COLUMN "polling_place_url" TEXT;
