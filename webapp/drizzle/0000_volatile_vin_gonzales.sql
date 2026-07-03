CREATE TYPE "public"."conversation_status" AS ENUM('ACTIVE', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."memory_scope" AS ENUM('BUSINESS', 'USER', 'CONVERSATION');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('USER', 'ASSISTANT', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."period_type" AS ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."refresh_strategy" AS ENUM('EVENT', 'SCHEDULE');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('CREATE', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TYPE "public"."security_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'MANUFACTURER', 'SERVICE');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('ACTIVE', 'INVITED', 'REMOVED');--> statement-breakpoint
CREATE TYPE "public"."catalog_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."party_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."party_type" AS ENUM('CUSTOMER', 'SUPPLIER', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('LOGIN', 'PASSWORD_RESET', 'MOBILE_VERIFICATION');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'INACTIVE', 'LOCKED');--> statement-breakpoint
CREATE TYPE "public"."movement_type" AS ENUM('OPENING_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "public"."ledger_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('WHATSAPP', 'SMS', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('PENDING', 'SENT', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('DRAFT', 'FINALIZED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."purchase_type" AS ENUM('PURCHASE', 'RETURN');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('DRAFT', 'FINALIZED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('SALE', 'RETURN');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE');--> statement-breakpoint
CREATE TYPE "public"."role_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."outbox_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('RUNNING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "ai_memory" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"conversation_id" uuid,
	"namespace" varchar(100) NOT NULL,
	"memory_key" varchar(100) NOT NULL,
	"scope" "memory_scope" NOT NULL,
	"data" jsonb NOT NULL,
	"importance" smallint NOT NULL,
	"expires_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200),
	"status" "conversation_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"snapshot_type_id" uuid NOT NULL,
	"period_type" "period_type" NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"version" smallint NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ah_history_unique" UNIQUE("business_id","snapshot_type_id","period_type","period_start")
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshot_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"refresh_strategy" "refresh_strategy" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_snapshot_type_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "analytics_snapshot" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"snapshot_type_id" uuid NOT NULL,
	"version" smallint NOT NULL,
	"data" jsonb NOT NULL,
	"checksum" varchar(64),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "as_business_type_unique" UNIQUE("business_id","snapshot_type_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid,
	"user_id" uuid,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"before_data" jsonb,
	"after_data" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"business_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"severity" "security_severity" NOT NULL,
	"ip_address" "inet",
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_member" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "member_status" DEFAULT 'ACTIVE' NOT NULL,
	CONSTRAINT "business_member_unique" UNIQUE("business_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "business_settings" (
	"business_id" uuid PRIMARY KEY NOT NULL,
	"invoice_prefix" varchar(20) DEFAULT 'INV' NOT NULL,
	"financial_year_start" date NOT NULL,
	"low_stock_threshold" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"legal_name" varchar(200),
	"business_type" "business_type" NOT NULL,
	"gstin" varchar(15),
	"pan" varchar(10),
	"phone" varchar(15) NOT NULL,
	"email" varchar(255),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(10),
	"logo_url" text,
	"status" "business_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_business_name_unique" UNIQUE("business_id","name")
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_business_name_unique" UNIQUE("business_id","name")
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" uuid PRIMARY KEY NOT NULL,
	"product_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"display_order" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"category_id" uuid,
	"brand_id" uuid,
	"unit_id" uuid NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(100),
	"name" varchar(200) NOT NULL,
	"description" text,
	"purchase_price" numeric(18, 2) NOT NULL,
	"selling_price" numeric(18, 2) NOT NULL,
	"mrp" numeric(18, 2),
	"gst_rate" numeric(5, 2) NOT NULL,
	"minimum_stock" numeric(18, 3) DEFAULT '0' NOT NULL,
	"hsn_code" varchar(20),
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_business_sku_unique" UNIQUE("business_id","sku")
);
--> statement-breakpoint
CREATE TABLE "unit" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"short_name" varchar(20) NOT NULL,
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "party" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"party_type" "party_type" NOT NULL,
	"name" varchar(200) NOT NULL,
	"company_name" varchar(200),
	"mobile" varchar(15),
	"email" varchar(255),
	"gstin" varchar(15),
	"pan" varchar(10),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(10),
	"opening_balance" numeric(18, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"status" "party_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "device" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"device_name" varchar(100),
	"platform" varchar(30),
	"app_version" varchar(20),
	"device_identifier" text NOT NULL,
	"is_trusted" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "otp" (
	"id" uuid PRIMARY KEY NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"otp_hash" text NOT NULL,
	"attempts" smallint DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"device_id" uuid,
	"refresh_token_hash" text NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"last_activity_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"mobile" varchar(15) NOT NULL,
	"email" varchar(255),
	"password_hash" text,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"reserved_quantity" numeric(18, 3) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_business_product_unique" UNIQUE("business_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "stock_movement" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"movement_type" "movement_type" NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"reference_type" varchar(30),
	"reference_id" uuid,
	"reason" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"expense_date" timestamp with time zone NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"remarks" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"reference_type" varchar(30),
	"reference_id" uuid,
	"entry_date" timestamp with time zone NOT NULL,
	"description" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_line" (
	"id" uuid PRIMARY KEY NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"ledger_account_id" uuid NOT NULL,
	"debit_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"credit_amount" numeric(18, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"account_code" varchar(20) NOT NULL,
	"account_name" varchar(150) NOT NULL,
	"account_type" "account_type" NOT NULL,
	"parent_account_id" uuid,
	"status" "ledger_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_delivery" (
	"id" uuid PRIMARY KEY NOT NULL,
	"notification_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"status" "delivery_status" DEFAULT 'PENDING' NOT NULL,
	"provider_reference" varchar(150),
	"error_message" text,
	"attempted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_template" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"subject" varchar(200),
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid,
	"recipient_type" varchar(30) NOT NULL,
	"recipient_id" uuid NOT NULL,
	"template_id" uuid,
	"title" varchar(200),
	"message" text NOT NULL,
	"status" "notification_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"purchase_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"unit_cost" numeric(18, 2) NOT NULL,
	"discount_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(18, 2) NOT NULL,
	"line_total" numeric(18, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"purchase_number" varchar(50) NOT NULL,
	"purchase_type" "purchase_type" NOT NULL,
	"purchase_date" timestamp with time zone NOT NULL,
	"supplier_invoice_number" varchar(100),
	"subtotal" numeric(18, 2) NOT NULL,
	"discount_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(18, 2) NOT NULL,
	"total_amount" numeric(18, 2) NOT NULL,
	"paid_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"balance_amount" numeric(18, 2) NOT NULL,
	"notes" text,
	"status" "purchase_status" NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_business_num_unique" UNIQUE("business_id","purchase_number")
);
--> statement-breakpoint
CREATE TABLE "supplier_payment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"purchase_id" uuid NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"reference_number" varchar(100),
	"remarks" text,
	"paid_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_item" (
	"id" uuid PRIMARY KEY NOT NULL,
	"invoice_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"unit_price" numeric(18, 2) NOT NULL,
	"discount_amount" numeric(18, 2) NOT NULL,
	"tax_amount" numeric(18, 2) NOT NULL,
	"line_total" numeric(18, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_id" uuid,
	"invoice_number" varchar(50) NOT NULL,
	"invoice_type" "invoice_type" NOT NULL,
	"invoice_date" timestamp with time zone NOT NULL,
	"subtotal" numeric(18, 2) NOT NULL,
	"discount_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(18, 2) NOT NULL,
	"total_amount" numeric(18, 2) NOT NULL,
	"paid_amount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"balance_amount" numeric(18, 2) NOT NULL,
	"notes" text,
	"status" "invoice_status" NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_business_num_unique" UNIQUE("business_id","invoice_number")
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"payment_date" timestamp with time zone NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"reference_number" varchar(100),
	"remarks" text,
	"received_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_role" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_member_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mr_member_role_unique" UNIQUE("business_member_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "permission" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permission_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permission" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rp_role_permission_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"status" "role_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_business_name_unique" UNIQUE("business_id","name")
);
--> statement-breakpoint
CREATE TABLE "background_job" (
	"id" uuid PRIMARY KEY NOT NULL,
	"job_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "job_status" DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"scheduled_at" timestamp with time zone,
	"schedule_expression" varchar(100),
	"is_recurring" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_outbox" (
	"id" uuid PRIMARY KEY NOT NULL,
	"event_id" uuid NOT NULL,
	"status" "outbox_status" DEFAULT 'PENDING' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid,
	"event_type" varchar(100) NOT NULL,
	"event_version" smallint DEFAULT 1 NOT NULL,
	"source_domain" varchar(50) NOT NULL,
	"aggregate_type" varchar(50) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"correlation_id" uuid NOT NULL,
	"causation_id" uuid,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_flag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"feature_name" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_feature_name_unique" UNIQUE("feature_name")
);
--> statement-breakpoint
CREATE TABLE "system_setting" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_action" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workflow_id" uuid NOT NULL,
	"action_order" smallint NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"configuration" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_execution" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workflow_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"status" "workflow_status" NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "workflow" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"trigger_event" varchar(100) NOT NULL,
	"condition" jsonb,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_memory" ADD CONSTRAINT "ai_memory_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_memory" ADD CONSTRAINT "ai_memory_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_memory" ADD CONSTRAINT "ai_memory_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_history" ADD CONSTRAINT "analytics_history_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_history" ADD CONSTRAINT "analytics_history_snapshot_type_id_analytics_snapshot_type_id_fk" FOREIGN KEY ("snapshot_type_id") REFERENCES "public"."analytics_snapshot_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshot" ADD CONSTRAINT "analytics_snapshot_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_snapshot" ADD CONSTRAINT "analytics_snapshot_snapshot_type_id_analytics_snapshot_type_id_fk" FOREIGN KEY ("snapshot_type_id") REFERENCES "public"."analytics_snapshot_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_event" ADD CONSTRAINT "security_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_event" ADD CONSTRAINT "security_event_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_member" ADD CONSTRAINT "business_member_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_member" ADD CONSTRAINT "business_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand" ADD CONSTRAINT "brand_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_unit_id_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit" ADD CONSTRAINT "unit_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "party" ADD CONSTRAINT "party_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device" ADD CONSTRAINT "device_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_device_id_device_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."device"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_ledger_account_id_ledger_account_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_journal_entry_id_journal_entry_id_fk" FOREIGN KEY ("journal_entry_id") REFERENCES "public"."journal_entry"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_line" ADD CONSTRAINT "journal_line_ledger_account_id_ledger_account_id_fk" FOREIGN KEY ("ledger_account_id") REFERENCES "public"."ledger_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_account" ADD CONSTRAINT "ledger_account_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_delivery" ADD CONSTRAINT "notification_delivery_notification_id_notification_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notification"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_template" ADD CONSTRAINT "notification_template_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_template_id_notification_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_purchase_id_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplier_id_party_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."party"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment" ADD CONSTRAINT "supplier_payment_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment" ADD CONSTRAINT "supplier_payment_purchase_id_purchase_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchase"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payment" ADD CONSTRAINT "supplier_payment_paid_by_user_id_fk" FOREIGN KEY ("paid_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_item" ADD CONSTRAINT "invoice_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_customer_id_party_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."party"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_invoice_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_received_by_user_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_business_member_id_business_member_id_fk" FOREIGN KEY ("business_member_id") REFERENCES "public"."business_member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_role" ADD CONSTRAINT "member_role_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_outbox" ADD CONSTRAINT "event_outbox_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_action" ADD CONSTRAINT "workflow_action_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "aim_business_memory_unique" ON "ai_memory" USING btree ("business_id","namespace","memory_key") WHERE "ai_memory"."user_id" IS NULL AND "ai_memory"."conversation_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "aim_user_memory_unique" ON "ai_memory" USING btree ("business_id","user_id","namespace","memory_key") WHERE "ai_memory"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "aim_conversation_memory_unique" ON "ai_memory" USING btree ("conversation_id","namespace","memory_key") WHERE "ai_memory"."conversation_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "aim_business_idx" ON "ai_memory" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "aim_user_idx" ON "ai_memory" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "aim_conversation_idx" ON "ai_memory" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "aim_namespace_idx" ON "ai_memory" USING btree ("namespace");--> statement-breakpoint
CREATE INDEX "aim_scope_idx" ON "ai_memory" USING btree ("scope");--> statement-breakpoint
CREATE INDEX "aim_expires_at_idx" ON "ai_memory" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "aim_data_gin_idx" ON "ai_memory" USING gin ("data");--> statement-breakpoint
CREATE INDEX "conv_business_idx" ON "conversation" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "conv_user_idx" ON "conversation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "conv_updated_at_idx" ON "conversation" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "msg_conversation_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "msg_created_at_idx" ON "message" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "msg_metadata_gin_idx" ON "message" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "ah_type_idx" ON "analytics_history" USING btree ("snapshot_type_id");--> statement-breakpoint
CREATE INDEX "ah_period_type_idx" ON "analytics_history" USING btree ("period_type");--> statement-breakpoint
CREATE INDEX "ah_period_start_idx" ON "analytics_history" USING btree ("period_start");--> statement-breakpoint
CREATE INDEX "ah_data_gin_idx" ON "analytics_history" USING gin ("data");--> statement-breakpoint
CREATE INDEX "ast_active_idx" ON "analytics_snapshot_type" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "as_data_gin_idx" ON "analytics_snapshot" USING gin ("data");--> statement-breakpoint
CREATE INDEX "as_updated_at_idx" ON "analytics_snapshot" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "audit_business_idx" ON "audit_log" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_entity_type_idx" ON "audit_log" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "audit_entity_id_idx" ON "audit_log" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sec_user_idx" ON "security_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sec_event_type_idx" ON "security_event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "sec_severity_idx" ON "security_event" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "sec_created_at_idx" ON "security_event" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "business_gstin_unique_idx" ON "business" USING btree ("gstin") WHERE "business"."gstin" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "business_name_idx" ON "business" USING btree ("name");--> statement-breakpoint
CREATE INDEX "business_phone_idx" ON "business" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "category_business_idx" ON "category" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "category_name_idx" ON "category" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "product_business_barcode_unique_idx" ON "product" USING btree ("business_id","barcode") WHERE "product"."barcode" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "product_business_idx" ON "product" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "product_category_idx" ON "product" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "product_brand_idx" ON "product" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "product_sku_idx" ON "product" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_barcode_idx" ON "product" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "product_name_idx" ON "product" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "party_business_mobile_unique_idx" ON "party" USING btree ("business_id","mobile") WHERE "party"."mobile" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "party_business_gstin_unique_idx" ON "party" USING btree ("business_id","gstin") WHERE "party"."gstin" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "device_user_idx" ON "device" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_identifier_idx" ON "device" USING btree ("device_identifier");--> statement-breakpoint
CREATE INDEX "otp_mobile_idx" ON "otp" USING btree ("mobile");--> statement-breakpoint
CREATE INDEX "otp_expires_at_idx" ON "otp" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "session_revoked_at_idx" ON "session" USING btree ("revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_unique_idx" ON "user" USING btree ("email") WHERE "user"."email" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "inventory_business_idx" ON "inventory" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "inventory_product_idx" ON "inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sm_business_idx" ON "stock_movement" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "sm_product_idx" ON "stock_movement" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sm_type_idx" ON "stock_movement" USING btree ("movement_type");--> statement-breakpoint
CREATE INDEX "sm_created_at_idx" ON "stock_movement" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "nd_notification_idx" ON "notification_delivery" USING btree ("notification_id");--> statement-breakpoint
CREATE INDEX "nd_channel_idx" ON "notification_delivery" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "nd_status_idx" ON "notification_delivery" USING btree ("status");--> statement-breakpoint
CREATE INDEX "nd_attempted_at_idx" ON "notification_delivery" USING btree ("attempted_at");--> statement-breakpoint
CREATE INDEX "nt_business_idx" ON "notification_template" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "nt_channel_idx" ON "notification_template" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "notification_business_idx" ON "notification" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "notification_recipient_type_idx" ON "notification" USING btree ("recipient_type");--> statement-breakpoint
CREATE INDEX "notification_recipient_id_idx" ON "notification" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notification_status_idx" ON "notification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ii_invoice_idx" ON "invoice_item" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "ii_product_idx" ON "invoice_item" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "invoice_business_idx" ON "invoice" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "invoice_customer_idx" ON "invoice" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "invoice_date_idx" ON "invoice" USING btree ("invoice_date");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoice" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_invoice_idx" ON "payment" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_date_idx" ON "payment" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "mr_member_idx" ON "member_role" USING btree ("business_member_id");--> statement-breakpoint
CREATE INDEX "mr_role_idx" ON "member_role" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "rp_role_idx" ON "role_permission" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "rp_permission_idx" ON "role_permission" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "role_business_idx" ON "role" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "role_status_idx" ON "role" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_status_idx" ON "background_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_type_idx" ON "background_job" USING btree ("job_type");--> statement-breakpoint
CREATE INDEX "job_scheduled_at_idx" ON "background_job" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "outbox_status_idx" ON "event_outbox" USING btree ("status");--> statement-breakpoint
CREATE INDEX "outbox_created_at_idx" ON "event_outbox" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "event_type_idx" ON "event" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "event_aggregate_type_idx" ON "event" USING btree ("aggregate_type");--> statement-breakpoint
CREATE INDEX "event_aggregate_id_idx" ON "event" USING btree ("aggregate_id");--> statement-breakpoint
CREATE INDEX "event_correlation_id_idx" ON "event" USING btree ("correlation_id");--> statement-breakpoint
CREATE INDEX "event_occurred_at_idx" ON "event" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "feature_enabled_idx" ON "feature_flag" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "wa_workflow_idx" ON "workflow_action" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "wa_action_order_idx" ON "workflow_action" USING btree ("action_order");--> statement-breakpoint
CREATE INDEX "we_workflow_idx" ON "workflow_execution" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "we_event_idx" ON "workflow_execution" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "we_status_idx" ON "workflow_execution" USING btree ("status");--> statement-breakpoint
CREATE INDEX "we_started_at_idx" ON "workflow_execution" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "workflow_business_idx" ON "workflow" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "workflow_trigger_event_idx" ON "workflow" USING btree ("trigger_event");--> statement-breakpoint
CREATE INDEX "workflow_enabled_idx" ON "workflow" USING btree ("is_enabled");