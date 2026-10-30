#!/usr/bin/env bash
# Στήνει τοπικά τη βάση minosltd από το dump και δημιουργεί χρήστη μόνο-για-ανάγνωση για την εφαρμογή.
# Ο κωδικός παράγεται τυχαία και γράφεται ΜΟΝΟ στο .env (δεν τυπώνεται, δεν μπαίνει στο git).
# Χρήση:  bash scripts/setup_local_db.sh          (θα ζητήσει sudo)
set -euo pipefail
cd "$(dirname "$0")/.."

DB=minosltd
APP_USER=minos_app
[ -f minosltd.sql ] || { echo "Λείπει το minosltd.sql στη ρίζα του repo."; exit 1; }

sudo systemctl enable --now mariadb
# Το dump βγήκε από MariaDB 11.8 (collation utf8mb4_uca1400_*), που η τοπική έκδοση δεν γνωρίζει.
# Το αντικαθιστούμε με το utf8mb4_unicode_ci. Τα δεδομένα δεν αλλάζουν.
sed -E 's/utf8mb4_(uca1400|0900)_[a-z0-9_]+/utf8mb4_unicode_ci/g' minosltd.sql | sudo mariadb   # περιέχει CREATE DATABASE και USE

PASS="$(openssl rand -hex 16)"
sudo mariadb <<SQL
CREATE USER IF NOT EXISTS '${APP_USER}'@'localhost' IDENTIFIED BY '${PASS}';
ALTER USER '${APP_USER}'@'localhost' IDENTIFIED BY '${PASS}';
GRANT SELECT ON \`${DB}\`.* TO '${APP_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

umask 077
sed "s/^DB_PASSWORD=.*/DB_PASSWORD=${PASS}/" .env.example > .env
echo "Έτοιμο: βάση '${DB}' φορτώθηκε, χρήστης '${APP_USER}' (SELECT μόνο), στοιχεία στο .env"
