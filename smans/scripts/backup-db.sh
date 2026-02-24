#!/usr/bin/env bash
# scripts/backup-db.sh
# Usage: ./scripts/backup-db.sh [optional-backup-name]

set -euo pipefail

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Required variables
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USER:-postgres}
DB_NAME=${DATABASE_NAME:-smans}
DB_PASSWORD=${DATABASE_PASSWORD:-}

# Optional backup name
BACKUP_NAME=${1:-"smans-$(date +%Y%m%d-%H%M%S)"}

# Output file
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.sql.gz"

echo "Backing up database '$DB_NAME' to $BACKUP_FILE..."

# Export PGPASSWORD for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Run pg_dump and compress
pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip > "$BACKUP_FILE"

echo "Backup completed successfully!"
echo "File: $BACKUP_FILE"
echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Optional: clean up old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete