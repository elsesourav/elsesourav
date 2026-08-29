# ElseSourav V2 Disaster Recovery & Operational Runbook

## Overview
This runbook defines failure modes, operational procedures, backup policies, restoration workflows, and incident response protocols for the ElseSourav V2 platform.

---

## 1. External Dependencies & Failure Matrix

| Service | Role | Impact if Unavailable | Fallback / Behavior |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | Primary Source of Truth | High (Reads & Writes fail) | Error boundaries display safe degraded state; `/api/health` returns 503; sitemap falls back to static routes |
| **Supabase Auth** | User Authentication | Medium (Auth fails) | Public content remains accessible; login/signup display graceful error message; no fake sessions |
| **Cloudinary** | Media Storage & Optimization | Low-Medium (Media uploads fail) | Existing cached media serves via CDN; uploads fail gracefully with user feedback; DB keeps old URLs |
| **Redis** | Rate Limiting & Cache | Low (Fallback to in-memory) | In-memory token bucket rate limiter handles burst protection automatically |

---

## 2. PostgreSQL Backup & Point-in-Time Recovery

### Backup Strategy
- **Automated Daily Snapshots**: Full database snapshots taken daily at 02:00 UTC with 30-day retention.
- **Continuous WAL Archiving**: Write-Ahead Logs (WAL) streamed continuously to secure object storage.
- **Point-in-Time Recovery (PITR)**: Enables database state recovery to any second within the retention window.

---

## 3. Database Restoration Procedure

In the event of severe data corruption or hardware failure:

### Step 1: Identify & Contain Failure
- Check `/api/health` status and monitoring alerts.
- If data corruption is actively occurring, enable maintenance mode or restrict write traffic at the edge proxy.

### Step 2: Provision / Target Restoration Instance
```bash
# Verify environment target connection string
export DATABASE_URL="postgresql://user:password@target-host:5432/elsesourav?sslmode=require"
```

### Step 3: Execute Restoration
- Restore snapshot to the target timestamp using managed provider CLI or `pg_restore`:
```bash
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URL" backup_dump.sql
```

### Step 4: Verify Schema & Run Smoke Queries
```bash
# Run Prisma schema validation and migration check
pnpm --filter @elsesourav/database prisma migrate status
```

### Step 5: Smoke Test Application Services
- Verify public catalog (`/apps`, `/blog`, `/help`).
- Verify user authentication and profile retrieval.
- Verify health check (`GET /api/health` -> 200 OK).

### Step 6: Route Production Traffic
- Switch connection pool DNS or deployment environment variable to the restored instance.

---

## 4. Prisma Migration Failure Handling

If `prisma migrate deploy` fails during deployment:
1. CI/CD pipeline immediately halts and aborts the release build.
2. Review migration logs to identify failing SQL statement (e.g. unique constraint collision or locked table).
3. Roll back or fix migration script locally:
   ```bash
   pnpm --filter @elsesourav/database prisma migrate resolve --rolled-back <migration_name>
   ```
4. Re-apply verified migration.

---

## 5. Media Replacement & Cloudinary Failure Protocol

To ensure zero lost media:
1. **Upload New Asset First**: Upload binary to Cloudinary signed endpoint.
2. **Update Database Reference**: Save new URL in PostgreSQL inside a transaction.
3. **Delete Old Asset Only on Success**: Never delete the previous asset until the database update has committed successfully.
4. If upload or database update fails, the old asset remains untouched and active.

---

## 6. Incident Response Framework

1. **Detect & Alert**: Monitoring triggers on elevated 5xx error rates, health check failures, or DB connection pool exhaustion.
2. **Triage & Contain**: On-call engineer identifies blast radius and halts corrupting inputs if necessary.
3. **Investigate & Remediate**: Check error logs, isolate root cause, apply hotfix or restore snapshot.
4. **Verify**: Run automated test suite (`pnpm test`) and check `/api/health`.
5. **Post-Mortem**: Document root cause, timeline, recovery duration, and preventive action items.
