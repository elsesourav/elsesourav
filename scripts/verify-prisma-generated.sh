#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

npm run db:generate

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Skipping Prisma drift diff check (not inside a git worktree)."
  exit 0
fi

if ! git diff --quiet --exit-code -- packages/db/src/generated/prisma; then
  echo "Prisma generated client is out of date."
  echo "Run: npm run db:generate"
  git --no-pager diff -- packages/db/src/generated/prisma | cat
  exit 1
fi

untracked_generated="$(git ls-files --others --exclude-standard -- packages/db/src/generated/prisma)"
if [[ -n "$untracked_generated" ]]; then
  echo "Untracked generated Prisma files detected:"
  echo "$untracked_generated"
  echo "Run: npm run db:generate and commit generated outputs."
  exit 1
fi

echo "Prisma generated client is up to date."
