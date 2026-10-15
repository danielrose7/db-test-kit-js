#!/usr/bin/env bash
# Runs the whole suite against a real Postgres (adds the concurrency tests that
# PGlite's single session can't run). Start one with `docker compose up -d`, or
# point TEST_PG_URL at any local server.
set -euo pipefail

DB="${TEST_DB_NAME:-db_test_kit}"
HOST_URL="${TEST_PG_URL:-postgresql://postgres:postgres@localhost:5432}"

psql "$HOST_URL/postgres" -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB" >/dev/null
TEST_DATABASE_URL="$HOST_URL/$DB" npx vitest run "$@"
