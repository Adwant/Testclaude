#!/usr/bin/env bash
# Выкладка прототипа на sportika2.estvkus.ru: ./prototype/deploy.sh user@sportika2.estvkus.ru /путь/к/webroot
set -euo pipefail
TARGET="${1:?user@host}"; DIR="${2:?/remote/webroot}"
cd "$(dirname "$0")"
rsync -avz --delete --exclude deploy.sh ./ "$TARGET:$DIR/"
echo "OK → https://sportika2.estvkus.ru/"
