-- CreateEnum
CREATE TYPE "SessionAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_RESET', 'TOKEN_REFRESH');

-- CreateEnum
CREATE TYPE "DataAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE');

-- CreateEnum
CREATE TYPE "RoleAction" AS ENUM ('ASSIGNED', 'REMOVED', 'ACTIVATED', 'DEACTIVATED', 'CONTEXT_CHANGED', 'VALIDITY_CHANGED');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('GRANTED', 'REVOKED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dni" TEXT,
    "phone" TEXT,
    "avatar_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "context" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_until" TIMESTAMP(3),
    "granted_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "SessionAction" NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "location" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "fail_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_logs" (
    "id" TEXT NOT NULL,
    "user_role_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "RoleAction" NOT NULL,
    "old_context" TEXT,
    "new_context" TEXT,
    "old_active" BOOLEAN,
    "new_active" BOOLEAN,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_logs" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission_logs" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "PermissionAction" NOT NULL,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permission_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_logs" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_logs" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_image_logs" (
    "id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_image_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_content_logs" (
    "id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_content_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_lines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'FlaskConical',
    "coordinator" TEXT,
    "members" INTEGER,
    "href" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "research_line_logs" (
    "id" TEXT NOT NULL,
    "research_line_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "research_line_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "type" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'FileText',
    "important" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "href" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" TEXT,
    "category" TEXT NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT,
    "event" TEXT,
    "category" TEXT,
    "date" TIMESTAMP(3),
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "href" TEXT,
    "important" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_event_logs" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "changed_by" TEXT,
    "action" "DataAction" NOT NULL,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "reason" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_content" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_dni_key" ON "users"("dni");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_deleted_at_idx" ON "roles"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_context_key" ON "user_roles"("user_id", "role_id", "context");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "session_logs_user_id_idx" ON "session_logs"("user_id");

-- CreateIndex
CREATE INDEX "session_logs_created_at_idx" ON "session_logs"("created_at");

-- CreateIndex
CREATE INDEX "user_logs_user_id_idx" ON "user_logs"("user_id");

-- CreateIndex
CREATE INDEX "user_logs_created_at_idx" ON "user_logs"("created_at");

-- CreateIndex
CREATE INDEX "user_role_logs_user_id_idx" ON "user_role_logs"("user_id");

-- CreateIndex
CREATE INDEX "user_role_logs_role_id_idx" ON "user_role_logs"("role_id");

-- CreateIndex
CREATE INDEX "user_role_logs_created_at_idx" ON "user_role_logs"("created_at");

-- CreateIndex
CREATE INDEX "role_logs_role_id_idx" ON "role_logs"("role_id");

-- CreateIndex
CREATE INDEX "role_logs_created_at_idx" ON "role_logs"("created_at");

-- CreateIndex
CREATE INDEX "role_permission_logs_role_id_idx" ON "role_permission_logs"("role_id");

-- CreateIndex
CREATE INDEX "role_permission_logs_created_at_idx" ON "role_permission_logs"("created_at");

-- CreateIndex
CREATE INDEX "announcement_logs_announcement_id_idx" ON "announcement_logs"("announcement_id");

-- CreateIndex
CREATE INDEX "announcement_logs_created_at_idx" ON "announcement_logs"("created_at");

-- CreateIndex
CREATE INDEX "document_logs_document_id_idx" ON "document_logs"("document_id");

-- CreateIndex
CREATE INDEX "document_logs_created_at_idx" ON "document_logs"("created_at");

-- CreateIndex
CREATE INDEX "gallery_image_logs_image_id_idx" ON "gallery_image_logs"("image_id");

-- CreateIndex
CREATE INDEX "gallery_image_logs_created_at_idx" ON "gallery_image_logs"("created_at");

-- CreateIndex
CREATE INDEX "site_content_logs_content_id_idx" ON "site_content_logs"("content_id");

-- CreateIndex
CREATE INDEX "site_content_logs_section_idx" ON "site_content_logs"("section");

-- CreateIndex
CREATE INDEX "site_content_logs_created_at_idx" ON "site_content_logs"("created_at");

-- CreateIndex
CREATE INDEX "research_lines_deleted_at_idx" ON "research_lines"("deleted_at");

-- CreateIndex
CREATE INDEX "research_lines_order_idx" ON "research_lines"("order");

-- CreateIndex
CREATE INDEX "research_line_logs_research_line_id_idx" ON "research_line_logs"("research_line_id");

-- CreateIndex
CREATE INDEX "research_line_logs_created_at_idx" ON "research_line_logs"("created_at");

-- CreateIndex
CREATE INDEX "announcements_deleted_at_idx" ON "announcements"("deleted_at");

-- CreateIndex
CREATE INDEX "documents_deleted_at_idx" ON "documents"("deleted_at");

-- CreateIndex
CREATE INDEX "gallery_images_deleted_at_idx" ON "gallery_images"("deleted_at");

-- CreateIndex
CREATE INDEX "calendar_events_deleted_at_idx" ON "calendar_events"("deleted_at");

-- CreateIndex
CREATE INDEX "calendar_events_date_idx" ON "calendar_events"("date");

-- CreateIndex
CREATE INDEX "calendar_event_logs_event_id_idx" ON "calendar_event_logs"("event_id");

-- CreateIndex
CREATE INDEX "calendar_event_logs_created_at_idx" ON "calendar_event_logs"("created_at");

-- CreateIndex
CREATE INDEX "site_content_deleted_at_idx" ON "site_content"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "site_content_section_key_key" ON "site_content"("section", "key");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_logs" ADD CONSTRAINT "user_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
