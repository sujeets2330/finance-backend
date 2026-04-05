-- This script initializes the financial database schema
-- It will be executed by the Prisma migration system

-- Create Users table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'VIEWER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLogin" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3)
);

-- Create indexes on User table
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Create FinancialRecord table
CREATE TABLE IF NOT EXISTS "FinancialRecord" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "FinancialRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Create indexes on FinancialRecord table
CREATE INDEX IF NOT EXISTS "FinancialRecord_userId_idx" ON "FinancialRecord"("userId");
CREATE INDEX IF NOT EXISTS "FinancialRecord_type_idx" ON "FinancialRecord"("type");
CREATE INDEX IF NOT EXISTS "FinancialRecord_date_idx" ON "FinancialRecord"("date");
CREATE INDEX IF NOT EXISTS "FinancialRecord_status_idx" ON "FinancialRecord"("status");
