-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'READY', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('MODERATED_IN_PERSON', 'MODERATED_REMOTE', 'UNMODERATED_REMOTE');

-- CreateEnum
CREATE TYPE "PrimaryMetric" AS ENUM ('SUCCESS_TIME', 'SUCCESS_ERRORS', 'SUCCESS_ONLY');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'IN_REVIEW', 'CLOSED');

-- CreateEnum
CREATE TYPE "TaskOutcome" AS ENUM ('UNASSISTED', 'ASSISTED', 'FAILED');

-- CreateEnum
CREATE TYPE "AiProviderKind" AS ENUM ('GEMINI', 'MOCK');

-- CreateEnum
CREATE TYPE "AiRunStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "AiGroupStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "Heuristic" AS ENUM ('H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10');

-- CreateEnum
CREATE TYPE "PourPrinciple" AS ENUM ('PERCEIVABLE', 'OPERABLE', 'UNDERSTANDABLE', 'ROBUST');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('DRAFT', 'APPROVED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CLOSED');

-- CreateTable
CREATE TABLE "test_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interface_name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "participant_profile" TEXT NOT NULL,
    "modality" "Modality" NOT NULL,
    "target_participants" INTEGER NOT NULL,
    "consent_ready" BOOLEAN NOT NULL DEFAULT false,
    "consent_text" TEXT,
    "moderator_notes" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "closed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_tasks" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "expected_result" TEXT NOT NULL,
    "primary_metric" "PrimaryMetric" NOT NULL,
    "success_criterion" TEXT NOT NULL,
    "equivalence_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "profile" TEXT,
    "consent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "current_task_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "sus_answers" INTEGER[],
    "sus_score" DOUBLE PRECISION,
    "sus_skip_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_results" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "outcome" "TaskOutcome",
    "elapsed_ms" INTEGER NOT NULL DEFAULT 0,
    "timer_started_at" TIMESTAMP(3),
    "time_adjusted" BOOLEAN NOT NULL DEFAULT false,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "observations" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "task_id" TEXT,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "observation_id" TEXT,
    "task_id" TEXT,
    "stored_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_runs" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" "AiRunStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "AiProviderKind" NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "redactions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_groups" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "status" "AiGroupStatus" NOT NULL DEFAULT 'PENDING',
    "observation_ids" TEXT[],
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "raw_response" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "findings" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "heuristics" "Heuristic"[],
    "pour" "PourPrinciple"[],
    "severity" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "story_title" TEXT NOT NULL,
    "story_text" TEXT NOT NULL,
    "acceptance_criteria" TEXT[],
    "confidence" DOUBLE PRECISION,
    "ai_original" JSONB NOT NULL,
    "edited_by_human" BOOLEAN NOT NULL DEFAULT false,
    "status" "FindingStatus" NOT NULL DEFAULT 'DRAFT',
    "discard_reason" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finding_observations" (
    "finding_id" TEXT NOT NULL,
    "observation_id" TEXT NOT NULL,

    CONSTRAINT "finding_observations_pkey" PRIMARY KEY ("finding_id","observation_id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "improvement_stories" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "finding_id" TEXT,
    "title" TEXT NOT NULL,
    "story_text" TEXT NOT NULL,
    "acceptance_criteria" TEXT[],
    "priority" "Priority" NOT NULL,
    "points" INTEGER,
    "status" "StoryStatus" NOT NULL DEFAULT 'BACKLOG',
    "rank" INTEGER NOT NULL,
    "sprint_id" TEXT,
    "assignee_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "improvement_sprints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "capacity_points" INTEGER NOT NULL,
    "status" "SprintStatus" NOT NULL DEFAULT 'PLANNED',
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "improvement_sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sprint_reviews" (
    "id" TEXT NOT NULL,
    "sprint_id" TEXT NOT NULL,
    "delivered_points" INTEGER NOT NULL,
    "pending_points" INTEGER NOT NULL,
    "delivered_codes" TEXT[],
    "pending_codes" TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprint_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrospectives" (
    "id" TEXT NOT NULL,
    "sprint_id" TEXT NOT NULL,
    "went_well" TEXT[],
    "went_wrong" TEXT[],
    "agreements" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retrospectives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_plans_status_idx" ON "test_plans"("status");

-- CreateIndex
CREATE INDEX "test_plans_interface_name_idx" ON "test_plans"("interface_name");

-- CreateIndex
CREATE UNIQUE INDEX "plan_tasks_plan_id_order_key" ON "plan_tasks"("plan_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "plan_tasks_plan_id_equivalence_key_key" ON "plan_tasks"("plan_id", "equivalence_key");

-- CreateIndex
CREATE UNIQUE INDEX "participants_plan_id_code_key" ON "participants"("plan_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_participant_id_key" ON "sessions"("participant_id");

-- CreateIndex
CREATE INDEX "sessions_plan_id_status_idx" ON "sessions"("plan_id", "status");

-- CreateIndex
CREATE INDEX "sessions_closed_at_idx" ON "sessions"("closed_at");

-- CreateIndex
CREATE UNIQUE INDEX "task_results_session_id_task_id_key" ON "task_results"("session_id", "task_id");

-- CreateIndex
CREATE INDEX "observations_session_id_idx" ON "observations"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_stored_name_key" ON "evidence"("stored_name");

-- CreateIndex
CREATE UNIQUE INDEX "ai_groups_run_id_index_key" ON "ai_groups"("run_id", "index");

-- CreateIndex
CREATE INDEX "findings_status_idx" ON "findings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "improvement_stories_number_key" ON "improvement_stories"("number");

-- CreateIndex
CREATE UNIQUE INDEX "improvement_stories_finding_id_key" ON "improvement_stories"("finding_id");

-- CreateIndex
CREATE INDEX "improvement_stories_status_rank_idx" ON "improvement_stories"("status", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "sprint_reviews_sprint_id_key" ON "sprint_reviews"("sprint_id");

-- CreateIndex
CREATE UNIQUE INDEX "retrospectives_sprint_id_key" ON "retrospectives"("sprint_id");

-- AddForeignKey
ALTER TABLE "plan_tasks" ADD CONSTRAINT "plan_tasks_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "test_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "test_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "test_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_results" ADD CONSTRAINT "task_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_results" ADD CONSTRAINT "task_results_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "plan_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "observations" ADD CONSTRAINT "observations_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "plan_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence" ADD CONSTRAINT "evidence_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "observations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "test_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_groups" ADD CONSTRAINT "ai_groups_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ai_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ai_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "ai_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_observations" ADD CONSTRAINT "finding_observations_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding_observations" ADD CONSTRAINT "finding_observations_observation_id_fkey" FOREIGN KEY ("observation_id") REFERENCES "observations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_stories" ADD CONSTRAINT "improvement_stories_finding_id_fkey" FOREIGN KEY ("finding_id") REFERENCES "findings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_stories" ADD CONSTRAINT "improvement_stories_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "improvement_sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "improvement_stories" ADD CONSTRAINT "improvement_stories_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "team_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sprint_reviews" ADD CONSTRAINT "sprint_reviews_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "improvement_sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrospectives" ADD CONSTRAINT "retrospectives_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "improvement_sprints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Integridad que Prisma no expresa (DATA_MODEL.md, "Notas de diseño").
ALTER TABLE "test_plans"
  ADD CONSTRAINT "test_plans_target_participants_check"
  CHECK ("target_participants" BETWEEN 1 AND 50);

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_sus_answers_check"
  CHECK (cardinality("sus_answers") IN (0, 10) AND "sus_answers" <@ ARRAY[1, 2, 3, 4, 5]);

ALTER TABLE "findings"
  ADD CONSTRAINT "findings_severity_check"
  CHECK ("severity" BETWEEN 0 AND 4);

-- RN-19: puntos en Fibonacci {1, 2, 3, 5, 8, 13}.
ALTER TABLE "improvement_stories"
  ADD CONSTRAINT "improvement_stories_points_check"
  CHECK ("points" IS NULL OR "points" IN (1, 2, 3, 5, 8, 13));
