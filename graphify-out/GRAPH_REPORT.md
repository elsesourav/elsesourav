# Graph Report - elsesourav  (2026-05-06)

## Corpus Check
- 345 files · ~384,938 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 858 nodes · 1331 edges · 35 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 152 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 41|Community 41]]

## God Nodes (most connected - your core abstractions)
1. `proxyAdminRoute()` - 64 edges
2. `proxyToService()` - 57 edges
3. `fetchServiceData()` - 46 edges
4. `proxyAdminRouteWithParams()` - 45 edges
5. `formatDateTime()` - 28 edges
6. `requireAdminContext()` - 26 edges
7. `proxyUserRoute()` - 24 edges
8. `parseApiMessage()` - 18 edges
9. `cn()` - 18 edges
10. `Card()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `serviceBaseUrl()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/app/admin/control/page.tsx → packages/config/src/env.ts
- `resolveServiceUrl()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `proxyToService()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `fetchServiceData()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `POST()` --calls--> `requireEnv()`  [INFERRED]
  apps/web/src/app/api/upload/cloudinary/sign/route.ts → packages/config/src/env.ts

## Communities (152 total, 17 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (56): createEmptyForm(), createFormFromItem(), fetchLinksForApp(), fetchMediaForApp(), onConfirmDelete(), onConfirmDeleteLink(), onConfirmDeleteTag(), onCreateApp() (+48 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (36): canScheduleCategoryDeletion(), formatDeletionDate(), onConfirmAction(), onCreateCategory(), parseApiMessage(), pushNotification(), resolveCategoryStatus(), runRowAction() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (34): AdminLayout(), SignOutButton(), AdminAppsPage(), AdminStoreBannersPage(), AdminContentBlogPage(), AdminCategoriesPage(), AdminThemeConfigsPage(), toExcerpt() (+26 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (21): startScheduledCategoryDeletionProcessor(), startScheduledDeletionProcessor(), attachRequestId(), getRequestId(), sendFailure(), sendSuccess(), requireAdminRole(), requireInternalToken() (+13 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (32): serviceBaseUrl(), DELETE(), GET(), POST(), POST(), GET(), GET(), failure() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (16): POST(), DELETE(), PATCH(), PUT(), proxyAdminRouteWithParams(), DELETE(), PATCH(), GET() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (20): GET(), POST(), GET(), POST(), GET(), PATCH(), GET(), POST() (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (13): GET(), POST(), GET(), POST(), proxyToService(), GET(), POST(), POST() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.2
Nodes (13): isDeletionConfirmationPhraseValid(), normalizeDeletionConfirmationValue(), resolveDeletionSectionStatus(), clampDeletionDelayDays(), findInvalidCustomThemeField(), fromCustomTheme(), resolveSettingsSectionStatus(), SettingsForm() (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (9): applyConfigPatch(), createEmptyThemeForm(), normalizeHexColor(), onConfirmActivate(), onCreateConfig(), onSaveConfigEdits(), parseApiMessage(), ThemePreview() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (10): createEditFormFromItem(), createEmptyForm(), onConfirmDelete(), onCreateSectionItem(), onSaveSectionItemEdits(), parseApiMessage(), SectionItemCard(), toDateTimeLocal() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.31
Nodes (10): createBannerFormFromItem(), createEmptyBannerForm(), normalizeBannerLinkUrl(), onConfirmDisableBanner(), onCreateBanner(), onSaveBannerEdits(), parseApiMessage(), toDateTimeLocal() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.23
Nodes (7): coerceMuiColor(), isMuiColor(), refreshMuiTheme(), resolveMuiModeFromDom(), resolveMuiPaletteFromCss(), selectNotifications(), createAppStore()

### Community 17 - "Community 17"
Cohesion: 0.27
Nodes (7): getThemeRuntimeData(), RootLayout(), buildThemeVariables(), normalizeHexColor(), resolveCustomThemeColor(), resolveThemeMode(), MuiEmotionCacheProvider()

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (4): HeroShowcase(), formatCompactCount(), formatRating(), pickFirstAvailableUrl()

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (5): CarouselContent(), CarouselIndicator(), CarouselIndicatorGroup(), Trigger(), useCarousel()

### Community 23 - "Community 23"
Cohesion: 0.52
Nodes (5): daysFromNow(), main(), requireEntity(), startOfUtcDay(), syncStatsForApp()

### Community 26 - "Community 26"
Cohesion: 0.6
Nodes (5): buildOpenApiDocument(), collectMountedRoutes(), extractPathParams(), normalizePath(), toOpenApiPath()

## Knowledge Gaps
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetchServiceData()` connect `Community 2` to `Community 1`, `Community 4`, `Community 15`, `Community 17`, `Community 20`, `Community 22`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `proxyToService()` connect `Community 7` to `Community 32`, `Community 33`, `Community 34`, `Community 2`, `Community 4`, `Community 6`, `Community 24`, `Community 25`, `Community 27`, `Community 31`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `Community 2` to `Community 0`, `Community 1`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 22`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `proxyAdminRoute()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyAdminRoute()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 25 inferred relationships involving `proxyToService()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`proxyToService()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `fetchServiceData()` (e.g. with `getThemeRuntimeData()` and `SettingsPage()`) actually correct?**
  _`fetchServiceData()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `proxyAdminRouteWithParams()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`proxyAdminRouteWithParams()` has 15 INFERRED edges - model-reasoned connections that need verification._