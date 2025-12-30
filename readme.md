# Pastebin Lite

## Description
A simple Pastebin-like service that allows users to create and share text pastes with optional expiry and view limits.

## Tech Stack
- Node.js
- Express
- Neon (Postgres)
- Raw SQL

## How to run locally
1. npm install
2. Set DATABASE_URL in .env
3. npm start

## Persistence
Uses Neon Postgres (serverless) to persist pastes across requests.
    