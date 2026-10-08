# Modelo de datos

Base de datos: **PostgreSQL 17** con **Prisma**. Diagrama ER: [`diagrams/02-entidad-relacion.md`](diagrams/02-entidad-relacion.md).

## Convenciones

- Modelos Prisma en `PascalCase` singular; tablas en `snake_case` plural con `@@map`; columnas en
  `snake_case` con `@map`.
- IDs `String @id @default(uuid())`.
- Todas las tablas: `createdAt` y `updatedAt` (`@updatedAt`), en UTC. La interfaz muestra fechas en
  `America/Guayaquil`.
- Enums en inglés (`UPPER_SNAKE`); la interfaz los traduce (`apps/web/src/lib/labels.ts`).
- Borrado: físico solo en borradores (tareas de un plan sin sesiones, evidencias de sesiones abiertas,
  observaciones de sesiones abiertas). Lo demás cambia de estado.
- **El esquema completo se crea en la migración inicial (DI-04).** Si una HU necesita cambiarlo: una
  migración nueva por PR, con nombre descriptivo (`pnpm prisma migrate dev --name add_x`), nunca se
  edita una migración ya fusionada.
- Integridad que Prisma no expresa (por ejemplo `severity` entre 0 y 4) se valida con Zod en
  `packages/shared` y, cuando es crítica, con un `CHECK` en una migración SQL.

## Esquema de referencia (`apps/api/prisma/schema.prisma`)

> Es la referencia para DI-04. Los nombres de modelos, campos y enums son el contrato: si cambias uno,
> actualiza este documento en el mismo PR.

```prisma
// Prisma 7: la URL de conexión NO va aquí; se define en apps/api/prisma.config.ts
// y el cliente se crea con el adaptador @prisma/adapter-pg (ver ARCHITECTURE.md §4).
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

// ---------- Enums ----------
enum PlanStatus {
  DRAFT
  READY
  IN_PROGRESS
  CLOSED
}

enum Modality {
  MODERATED_IN_PERSON
  MODERATED_REMOTE
  UNMODERATED_REMOTE
}

enum PrimaryMetric {
  SUCCESS_TIME
  SUCCESS_ERRORS
  SUCCESS_ONLY
}

enum SessionStatus {
  IN_PROGRESS
  IN_REVIEW
  CLOSED
}

enum TaskOutcome {
  UNASSISTED
  ASSISTED
  FAILED
}

enum AiProviderKind {
  GEMINI
  MOCK
}

enum AiRunStatus {
  PENDING
  RUNNING
  DONE
  PARTIAL
  FAILED
}

enum AiGroupStatus {
  PENDING
  RUNNING
  DONE
  FAILED
}

enum Heuristic {
  H1
  H2
  H3
  H4
  H5
  H6
  H7
  H8
  H9
  H10
}

enum PourPrinciple {
  PERCEIVABLE
  OPERABLE
  UNDERSTANDABLE
  ROBUST
}

enum FindingStatus {
  DRAFT
  APPROVED
  DISCARDED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum StoryStatus {
  BACKLOG
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum SprintStatus {
  PLANNED
  ACTIVE
  CLOSED
}

// ---------- Planes ----------
model TestPlan {
  id                 String        @id @default(uuid())
  name               String
  interfaceName      String        @map("interface_name")
  objective          String
  participantProfile String        @map("participant_profile")
  modality           Modality
  targetParticipants Int           @map("target_participants")      // cupo 1–50
  consentReady       Boolean       @default(false) @map("consent_ready")
  consentText        String?       @map("consent_text")              // texto o enlace del formulario
  moderatorNotes     String?       @map("moderator_notes")
  status             PlanStatus    @default(DRAFT)
  closedAt           DateTime?     @map("closed_at")
  version            Int           @default(1)
  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")
  tasks              PlanTask[]
  participants       Participant[]
  sessions           Session[]
  aiRuns             AiRun[]

  @@index([status])
  @@index([interfaceName])
  @@map("test_plans")
}

model PlanTask {
  id               String        @id @default(uuid())
  planId           String        @map("plan_id")
  order            Int
  instruction      String                                  // consigna neutral
  expectedResult   String        @map("expected_result")
  primaryMetric    PrimaryMetric @map("primary_metric")
  successCriterion String        @map("success_criterion")
  equivalenceKey   String        @map("equivalence_key")    // kebab-case; RN-12
  createdAt        DateTime      @default(now()) @map("created_at")
  updatedAt        DateTime      @updatedAt @map("updated_at")
  plan             TestPlan      @relation(fields: [planId], references: [id], onDelete: Cascade)
  results          TaskResult[]
  observations     Observation[]

  @@unique([planId, order])
  @@unique([planId, equivalenceKey])
  @@map("plan_tasks")
}

// ---------- Participantes y sesiones ----------
model Participant {
  id        String    @id @default(uuid())
  planId    String    @map("plan_id")
  code      String                                // P-001 (sin datos personales, RN-17)
  profile   String?                               // descripción genérica
  consentAt DateTime? @map("consent_at")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  plan      TestPlan  @relation(fields: [planId], references: [id], onDelete: Cascade)
  session   Session?

  @@unique([planId, code])
  @@map("participants")
}

model Session {
  id            String        @id @default(uuid())
  planId        String        @map("plan_id")
  participantId String        @unique @map("participant_id")
  status        SessionStatus @default(IN_PROGRESS)
  currentTaskId String?       @map("current_task_id")   // para reanudar
  startedAt     DateTime      @default(now()) @map("started_at")
  closedAt      DateTime?     @map("closed_at")
  susAnswers    Int[]         @map("sus_answers")       // 10 valores 1–5 (HU-13); vacío si no aplica
  susScore      Float?        @map("sus_score")
  susSkipReason String?       @map("sus_skip_reason")
  version       Int           @default(1)
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  plan          TestPlan      @relation(fields: [planId], references: [id], onDelete: Cascade)
  participant   Participant   @relation(fields: [participantId], references: [id], onDelete: Cascade)
  results       TaskResult[]
  observations  Observation[]
  evidence      Evidence[]

  @@index([planId, status])
  @@index([closedAt])
  @@map("sessions")
}

model TaskResult {
  id             String       @id @default(uuid())
  sessionId      String       @map("session_id")
  taskId         String       @map("task_id")
  outcome        TaskOutcome?                            // null = pendiente
  elapsedMs      Int          @default(0) @map("elapsed_ms")
  timerStartedAt DateTime?    @map("timer_started_at")   // no nulo = corriendo (RN-08)
  timeAdjusted   Boolean      @default(false) @map("time_adjusted")
  errorCount     Int          @default(0) @map("error_count")
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt @map("updated_at")
  session        Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  task           PlanTask     @relation(fields: [taskId], references: [id], onDelete: Restrict)

  @@unique([sessionId, taskId])
  @@map("task_results")
}

model Observation {
  id        String               @id @default(uuid())
  sessionId String               @map("session_id")
  taskId    String?              @map("task_id")
  text      String
  createdAt DateTime             @default(now()) @map("created_at")
  updatedAt DateTime             @updatedAt @map("updated_at")
  session   Session              @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  task      PlanTask?            @relation(fields: [taskId], references: [id], onDelete: SetNull)
  evidence  Evidence[]
  findings  FindingObservation[]

  @@index([sessionId])
  @@map("observations")
}

model Evidence {
  id            String       @id @default(uuid())
  sessionId     String       @map("session_id")
  observationId String?      @map("observation_id")
  taskId        String?      @map("task_id")
  storedName    String       @unique @map("stored_name")   // uuid + extensión real
  originalName  String       @map("original_name")
  mimeType      String       @map("mime_type")
  sizeBytes     Int          @map("size_bytes")
  sha256        String
  createdAt     DateTime     @default(now()) @map("created_at")
  session       Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  observation   Observation? @relation(fields: [observationId], references: [id], onDelete: SetNull)

  @@map("evidence")
}

// ---------- IA ----------
model AiRun {
  id            String         @id @default(uuid())
  planId        String         @map("plan_id")
  status        AiRunStatus    @default(PENDING)
  provider      AiProviderKind
  model         String
  promptVersion String         @map("prompt_version")
  redactions    Int            @default(0)               // reemplazos de RN-17
  createdAt     DateTime       @default(now()) @map("created_at")
  finishedAt    DateTime?      @map("finished_at")
  plan          TestPlan       @relation(fields: [planId], references: [id], onDelete: Cascade)
  groups        AiGroup[]
  findings      Finding[]

  @@map("ai_runs")
}

model AiGroup {
  id             String        @id @default(uuid())
  runId          String        @map("run_id")
  index          Int
  status         AiGroupStatus @default(PENDING)
  observationIds String[]      @map("observation_ids")
  attempts       Int           @default(0)
  rawResponse    Json?         @map("raw_response")
  error          String?
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")
  run            AiRun         @relation(fields: [runId], references: [id], onDelete: Cascade)
  findings       Finding[]

  @@unique([runId, index])
  @@map("ai_groups")
}

model Finding {
  id                 String               @id @default(uuid())
  runId              String               @map("run_id")
  groupId            String               @map("group_id")
  summary            String
  heuristics         Heuristic[]
  pour               PourPrinciple[]
  severity           Int                                     // 0–4 (Zod + CHECK)
  justification      String
  suggestion         String
  storyTitle         String               @map("story_title")
  storyText          String               @map("story_text")   // "Como… quiero… para…"
  acceptanceCriteria String[]             @map("acceptance_criteria")
  confidence         Float?                                   // 0–1 declarada por la IA
  aiOriginal         Json                 @map("ai_original")
  editedByHuman      Boolean              @default(false) @map("edited_by_human")
  status             FindingStatus        @default(DRAFT)
  discardReason      String?              @map("discard_reason")
  reviewedAt         DateTime?            @map("reviewed_at")
  createdAt          DateTime             @default(now()) @map("created_at")
  updatedAt          DateTime             @updatedAt @map("updated_at")
  run                AiRun                @relation(fields: [runId], references: [id], onDelete: Cascade)
  group              AiGroup              @relation(fields: [groupId], references: [id], onDelete: Cascade)
  observations       FindingObservation[]
  story              ImprovementStory?

  @@index([status])
  @@map("findings")
}

model FindingObservation {
  findingId     String      @map("finding_id")
  observationId String      @map("observation_id")
  finding       Finding     @relation(fields: [findingId], references: [id], onDelete: Cascade)
  observation   Observation @relation(fields: [observationId], references: [id], onDelete: Cascade)

  @@id([findingId, observationId])
  @@map("finding_observations")
}

// ---------- Mejoras (Scrum interno) ----------
model TeamMember {
  id        String             @id @default(uuid())
  name      String
  role      String?
  createdAt DateTime           @default(now()) @map("created_at")
  stories   ImprovementStory[]

  @@map("team_members")
}

model ImprovementStory {
  id                 String             @id @default(uuid())
  number             Int                @unique @default(autoincrement())   // MX-{number:3}
  findingId          String?            @unique @map("finding_id")           // RN-09: 1 historia por hallazgo
  title              String
  storyText          String             @map("story_text")
  acceptanceCriteria String[]           @map("acceptance_criteria")
  priority           Priority
  points             Int?                                                  // Fibonacci (RN-19)
  status             StoryStatus        @default(BACKLOG)
  rank               Int                                                   // orden en el backlog
  sprintId           String?            @map("sprint_id")
  assigneeId         String?            @map("assignee_id")
  createdAt          DateTime           @default(now()) @map("created_at")
  updatedAt          DateTime           @updatedAt @map("updated_at")
  finding            Finding?           @relation(fields: [findingId], references: [id], onDelete: SetNull)
  sprint             ImprovementSprint? @relation(fields: [sprintId], references: [id], onDelete: SetNull)
  assignee           TeamMember?        @relation(fields: [assigneeId], references: [id], onDelete: SetNull)

  @@index([status, rank])
  @@map("improvement_stories")
}

model ImprovementSprint {
  id             String             @id @default(uuid())
  name           String
  goal           String
  startDate      DateTime           @map("start_date") @db.Date
  endDate        DateTime           @map("end_date") @db.Date
  capacityPoints Int                @map("capacity_points")
  status         SprintStatus       @default(PLANNED)
  closedAt       DateTime?          @map("closed_at")
  createdAt      DateTime           @default(now()) @map("created_at")
  updatedAt      DateTime           @updatedAt @map("updated_at")
  stories        ImprovementStory[]
  review         SprintReview?
  retrospective  Retrospective?

  @@map("improvement_sprints")
}

model SprintReview {
  id              String            @id @default(uuid())
  sprintId        String            @unique @map("sprint_id")
  deliveredPoints Int               @map("delivered_points")     // calculado al cerrar
  pendingPoints   Int               @map("pending_points")
  deliveredCodes  String[]          @map("delivered_codes")      // instantánea MX entregadas
  pendingCodes    String[]          @map("pending_codes")
  notes           String?
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  sprint          ImprovementSprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)

  @@map("sprint_reviews")
}

model Retrospective {
  id         String            @id @default(uuid())
  sprintId   String            @unique @map("sprint_id")
  wentWell   String[]          @map("went_well")
  wentWrong  String[]          @map("went_wrong")
  agreements Json                                             // [{ text, owner? }]
  createdAt  DateTime          @default(now()) @map("created_at")
  updatedAt  DateTime          @updatedAt @map("updated_at")
  sprint     ImprovementSprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)

  @@map("retrospectives")
}
```

## Notas de diseño

- **Una sesión por participante** (`participantId @unique`): el código `P-xxx` identifica la sesión en
  la interfaz.
- Al crear una sesión se crean sus `TaskResult` (uno por tarea, `outcome = null`) en la misma
  transacción: así "pendiente" es explícito y RN-05 es un simple conteo.
- `TaskResult.task` usa `onDelete: Restrict`: no se puede borrar una tarea con resultados (refuerza RN-04).
- Código MX = `MX-` + `number` con 3 dígitos. `autoincrement` garantiza unicidad y no reutilización
  (RN-19). El seed ajusta la secuencia para empezar las historias demo en MX-008.
- `rank` usa saltos de 1000 para reordenar sin renumerar todo; se normaliza si dos quedan contiguos.
- `Finding.severity` y los 10 valores de `susAnswers` se validan con Zod; además se agregan `CHECK`
  (`severity BETWEEN 0 AND 4`) en una migración SQL de DI-04.
- La comparación (HU-12) y el informe (HU-11) **no se guardan**: se calculan al vuelo con `shared/domain`.
- Las acciones del cronómetro (`start`/`pause`/`reset`) son endpoints propios (RN-08) que usan el reloj
  del servidor.
