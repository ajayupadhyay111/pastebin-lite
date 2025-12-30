# Pastebin Lite

## Overview
Pastebin Lite is a simple web application that allows users to create and share text pastes with optional **time-to-live (TTL)** and **view-count limits**.  
Once a paste expires or exceeds its view limit, it becomes unavailable.

This project was built as a take-home assignment and focuses on **backend correctness, persistence, and robustness** rather than UI styling.

---

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: Neon (PostgreSQL)
- **Database Access**: Raw SQL (Neon serverless driver)
- **Frontend**: React
- **Deployed**: Render

---

## Features
- Create a text paste
- Generate a shareable URL
- View a paste via URL
- Optional paste expiry (TTL)
- Optional maximum view limit
- Deterministic time support for automated testing
- Persistent storage using serverless PostgreSQL

---

## Prerequisites
- Node.js (v18 or higher recommended)
- A Neon PostgreSQL database (free tier is sufficient)

---

## Database Setup (Required)

This project uses **PostgreSQL (Neon)** as the persistence layer.  
The database table must be created **before running the application**.

### 1. Create a Neon Database
1. Visit https://neon.tech
2. Create a new project
3. Copy the **pooled connection string** (Postgres URL)

### 2. Create the Table
Run the following SQL in the Neon SQL editor:

```sql
CREATE TABLE IF NOT EXISTS "Paste" (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  "createdAt" BIGINT NOT NULL,
  "expiresAt" BIGINT,
  "maxViews" INTEGER,
  "viewsUsed" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "Paste_expiresAt_idx"
ON "Paste" ("expiresAt");
```
