#!/bin/sh
# Nightly backup: MariaDB dump + uploaded files, kept for 14 days.
# Install: sudo cp deploy/backup.sh /usr/local/bin/raspedu-backup && sudo chmod 750 /usr/local/bin/raspedu-backup
# Cron (root): 30 3 * * * /usr/local/bin/raspedu-backup
set -eu

BACKUP_DIR=/var/backups/raspedu
DB_NAME=raspedu
UPLOADS=/opt/raspedu/strapi/public/uploads
STAMP=$(date +%Y-%m-%d_%H%M)

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# root connects through the unix socket, no password needed on Debian
mariadb-dump --single-transaction --default-character-set=utf8mb4 "$DB_NAME" | gzip > "$BACKUP_DIR/db_$STAMP.sql.gz"
tar -czf "$BACKUP_DIR/uploads_$STAMP.tar.gz" -C "$(dirname "$UPLOADS")" "$(basename "$UPLOADS")"

find "$BACKUP_DIR" -type f -mtime +14 -delete
