#!/usr/bin/env bash
# scripts/restore-db.sh
# Usage: ./scripts/restore-db.sh path/to/backup.sql.gz

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Load env
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USER:-postgres}
DB_NAME=${DATABASE_NAME:-smans}
DB_PASSWORD=${DATABASE_PASSWORD:-}

echo "WARNING: This will OVERWRITE the database '$DB_NAME'!"
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore cancelled."
  exit 1
fi

echo "Restoring from $BACKUP_FILE..."

export PGPASSWORD="$DB_PASSWORD"

# Drop and recreate DB (optional - comment out if you want to preserve)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE \"$DB_NAME\";"

# Restore
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

echo "Database restored successfully from $BACKUP_FILE"