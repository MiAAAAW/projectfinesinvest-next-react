-- CreateTable
CREATE TABLE "authorities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "office_hours" TEXT,
    "avatar_url" TEXT,
    "linkedin" TEXT,
    "orcid" TEXT,
    "google_scholar" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authority_logs" (
    "id" TEXT NOT NULL,
    "authority_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authority_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "schedule" TEXT,
    "responsible" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Building2',
    "map_url" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_logs" (
    "id" TEXT NOT NULL,
    "office_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "office_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "specialty" TEXT,
    "degree" TEXT,
    "orcid" TEXT,
    "google_scholar" TEXT,
    "linkedin" TEXT,
    "bio" TEXT,
    "user_id" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_research_lines" (
    "teacher_id" TEXT NOT NULL,
    "research_line_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'investigador',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_research_lines_pkey" PRIMARY KEY ("teacher_id","research_line_id")
);

-- CreateTable
CREATE TABLE "teacher_logs" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "authorities_deleted_at_idx" ON "authorities"("deleted_at");

-- CreateIndex
CREATE INDEX "authorities_order_idx" ON "authorities"("order");

-- CreateIndex
CREATE INDEX "authority_logs_authority_id_idx" ON "authority_logs"("authority_id");

-- CreateIndex
CREATE INDEX "authority_logs_created_at_idx" ON "authority_logs"("created_at");

-- CreateIndex
CREATE INDEX "offices_deleted_at_idx" ON "offices"("deleted_at");

-- CreateIndex
CREATE INDEX "offices_order_idx" ON "offices"("order");

-- CreateIndex
CREATE INDEX "office_logs_office_id_idx" ON "office_logs"("office_id");

-- CreateIndex
CREATE INDEX "office_logs_created_at_idx" ON "office_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE INDEX "teachers_deleted_at_idx" ON "teachers"("deleted_at");

-- CreateIndex
CREATE INDEX "teachers_order_idx" ON "teachers"("order");

-- CreateIndex
CREATE INDEX "teacher_logs_teacher_id_idx" ON "teacher_logs"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_logs_created_at_idx" ON "teacher_logs"("created_at");

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_research_lines" ADD CONSTRAINT "teacher_research_lines_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_research_lines" ADD CONSTRAINT "teacher_research_lines_research_line_id_fkey" FOREIGN KEY ("research_line_id") REFERENCES "research_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
