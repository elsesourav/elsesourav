# Data Backup, Recovery & Disaster Management Guide

This document establishes the operational procedures for protecting, backing up, verifying, and recovering data for ElseSourav.

---

## 1. Data Inventory & Classification

### Critical Platform Data (Must Be Backed Up)
| Collection Path | Entity Type | Data Criticality | Recovery RPO / RTO Target |
| :--- | :--- | :--- | :--- |
| `/apps` | Applications & metadata | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/apps/{appId}/versions` | Historical app releases | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/categories` | Platform software taxonomy | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/tags` | Discovery & search tags | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/blogPosts` | Engineering articles & guides | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/helpArticles` | Documentation & troubleshooting | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/helpCategories` | Help topic structure | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/users` | User profiles & roles | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/users/{userId}/library` | User bookmarked apps | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/supportTickets` | Support ticket inquiries | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/supportTickets/{id}/messages` | Ticket conversation thread | **Critical** | RPO < 24 hrs / RTO < 1 hr |
| `/auditLogs` | Administrative audit trail | **Critical (Immutable)** | RPO < 24 hrs / RTO < 1 hr |

### Derived & Ephemeral Data (Reconstructible / Low Risk)
| Collection Path | Entity Type | Retention Policy | Notes |
| :--- | :--- | :--- | :--- |
| `/analytics` | Page views & launch events | Aggregated monthly | Can be reconstructed or left un-restored |
| `/notifications` | In-app user notifications | 30-day auto-purge | User-specific ephemeral events |

---

## 2. Cloud Firestore Backup Strategy

ElseSourav uses Google Cloud / Firebase native managed backup infrastructure. Backups are executed on Google Cloud servers and stored in Google Cloud Storage (GCS).

### A. Point-in-Time Recovery (PITR)
Firestore provides automated Point-in-Time Recovery (PITR).
- **Retention**: Continuous recovery window of 7 days.
- **Granularity**: Restore database state to any exact minute within the last 7 days.
- **Activation**:
  ```bash
  gcloud firestore databases update --enable-pitr
  ```

### B. Automated Scheduled Exports (Daily / Weekly)
Automated daily snapshots export all critical collections to a secure, private GCS bucket.
- **Bucket**: `gs://[PROJECT_ID]-firestore-backups/`
- **Execution Command**:
  ```bash
  gcloud firestore export gs://[PROJECT_ID]-firestore-backups/$(date +%Y-%m-%d) \
    --collection-ids='apps,categories,tags,blogPosts,helpArticles,helpCategories,users,supportTickets,auditLogs'
  ```
- **Automated Cloud Scheduler**:
  Configured via Cloud Functions or Cloud Scheduler to trigger the export API every night at `02:00 UTC`.

---

## 3. Data Restoration Runbook

> [!WARNING]
> Restoring data will overwrite existing document IDs with the snapshot's state. Always take a manual backup before performing any restoration.

### Restoration Steps

1. **Take an Immediate Snapshot of Current State**:
   ```bash
   gcloud firestore export gs://[PROJECT_ID]-firestore-backups/pre-restore-$(date +%s)
   ```

2. **Restore Specific Collections or Entire Database**:
   ```bash
   gcloud firestore import gs://[PROJECT_ID]-firestore-backups/[BACKUP_DATE]/ \
     --collection-ids='apps,categories,tags,blogPosts,helpArticles,helpCategories,users,supportTickets,auditLogs'
   ```

3. **Referential Restoration Ordering**:
   If restoring manually or in stages, restore in dependency order:
   1. `/categories` and `/tags` (Dependencies for apps and blog)
   2. `/helpCategories` (Dependencies for help articles)
   3. `/users` (Dependencies for support tickets and user libraries)
   4. `/apps` and `/apps/{id}/versions`
   5. `/blogPosts` and `/helpArticles`
   6. `/supportTickets` and thread messages
   7. `/auditLogs`

4. **Post-Restore Integrity Verification**:
   - Run the data validation suite:
     ```bash
     npm run test
     ```
   - Re-generate and verify the sitemap:
     ```bash
     npm run build:sitemap
     ```

---

## 4. Soft Delete & Content Archival

To protect against accidental administrative deletion:
1. **Prefer Archival over Permanent Deletion**:
   - Apps: Change status to `archived` or call `appRepository.archive(id)` rather than `delete(id)`.
   - Blog Posts: Change status to `draft` or `archived`.
   - Help Articles: Change status to `draft` or `archived`.
2. **Soft Deletion Mechanism**:
   - `FirestoreRepository.softDelete(id)` sets `deletedAt: Date.now()` and `isDeleted: true` without removing the document from Firestore.
   - Soft-deleted records are automatically filtered from public listings and sitemaps.
   - Soft-deleted records can be restored at any time via `FirestoreRepository.restoreSoftDeleted(id)`.

---

## 5. Emergency Rollback Procedures

### Emergency App Unpublish
If a published application has a critical issue, unpublish immediately via Admin Portal or CLI:
- In Admin Portal: Click **Unpublish** on the application row.
- Programmatic: `appRepository.unpublish(appId)` reverts status to `draft` instantly, immediately hiding it from the public catalog and search indexing.

### Security Rules Rollback
If a faulty security rule is deployed:
1. Check out the last known good commit: `git checkout HEAD~1 firestore.rules`
2. Deploy immediately:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Web App Deployment Rollback
If a frontend deployment exhibits regression:
1. In Firebase Console: Go to **Hosting** → **Release History** → Click **Rollback** on the previous healthy release.
2. In Git: Revert commit and push:
   ```bash
   git revert HEAD
   git push origin main
   ```
