#!/usr/bin/env bash
# Prisma needs a real Postgres (no in-process backend here). Start one with
# `docker compose up -d` (../../docker-compose.yml), or point TEST_PG_URL at any
# local server. Builds a throwaway database, then runs the suite against it.
set -euo pipefail

DB="${TEST_DB_NAME:-db_test_kit_prisma}"
HOST_URL="${TEST_PG_URL:-postgresql://postgres:postgres@localhost:5432}"

psql "$HOST_URL/postgres" -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB" >/dev/null
npx prisma generate >/dev/null
TEST_DATABASE_URL="$HOST_URL/$DB" npx vitest run "$@"
