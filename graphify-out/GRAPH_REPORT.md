# Graph Report - elsesourav  (2026-05-26)

## Corpus Check
- 417 files · ~462,655 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1081 nodes · 1649 edges · 49 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 187 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 11|Community 11]]
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
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `proxyToService()` - 79 edges
2. `proxyAdminRoute()` - 71 edges
3. `fetchServiceData()` - 61 edges
4. `proxyAdminRouteWithParams()` - 54 edges
5. `requireAdminContext()` - 43 edges
6. `formatDateTime()` - 33 edges
7. `cn()` - 27 edges
8. `proxyUserRoute()` - 24 edges
9. `Card()` - 21 edges
10. `CardTitle()` - 21 edges

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

## Communities (191 total, 21 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (23): ProfileController, startScheduledCategoryDeletionProcessor(), startScheduledDeletionProcessor(), attachRequestId(), getRequestId(), sendFailure(), sendSuccess(), requireAdminRole() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (33): getAdminAuthStats(), getAdminCatalogStats(), getAdminUserStats(), AdminLayout(), AdminPage(), SignOutButton(), AdminAppsPage(), AdminHelpArticlesPage() (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (39): createFormFromItem(), createEmptyPostForm(), createPostFormFromItem(), onConfirmArchivePost(), onConfirmPublishPost(), onCreatePost(), onCreateTag(), onDeleteTag() (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (18): POST(), DELETE(), GET(), PATCH(), PUT(), proxyAdminRouteWithParams(), DELETE(), PATCH() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (27): toExcerpt(), markdownExcerpt(), markdownToPlainText(), requireUserContext(), formatDateTime(), LibraryPage(), ContentPageCard(), isDeletionConfirmationPhraseValid() (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (32): AppCard(), createEmptyForm(), fetchLinksForApp(), fetchMediaForApp(), onConfirmDelete(), onConfirmDeleteLink(), onConfirmDeleteTag(), onCreateApp() (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (6): ActivityStream(), HeroShowcase(), formatCompactCount(), formatRating(), pickFirstAvailableUrl(), cn()

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (21): GET(), POST(), GET(), GET(), POST(), GET(), POST(), proxyToService() (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (16): AppsBannerSlider(), buildDetails(), buildMeta(), formatBannerDate(), ResendVerificationClient(), createEditFormFromItem(), createEmptyForm(), onConfirmDelete() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.1
Nodes (24): DELETE(), GET(), POST(), POST(), GET(), GET(), failure(), getRequestId() (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (20): GET(), POST(), GET(), POST(), GET(), POST(), GET(), PATCH() (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (6): getApiErrorMessage(), handleSubmit(), HelpSupportPaths(), Card(), CardDescription(), CardTitle()

### Community 12 - "Community 12"
Cohesion: 0.2
Nodes (11): serviceBaseUrl(), getServerEnv(), requireEnv(), createQueue(), createWorker(), deleteCache(), deleteCacheByPattern(), getCache() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.26
Nodes (11): createBannerFormFromItem(), createEmptyBannerForm(), getPlacementDateLabel(), normalizeBannerLinkUrl(), onConfirmDisableBanner(), onCreateBanner(), onSaveBannerEdits(), parseApiMessage() (+3 more)

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (7): AdminCustomFieldsClient(), buildDefinitionPayload(), formatJsonForEditor(), formatJsonInline(), parseOptionalJson(), parseRequiredJson(), toDefinitionForm()

### Community 15 - "Community 15"
Cohesion: 0.24
Nodes (9): applyConfigPatch(), createEmptyThemeForm(), normalizeHexColor(), onConfirmActivate(), onCreateConfig(), onSaveConfigEdits(), parseApiMessage(), ThemePreview() (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (4): handlePointerDown(), isPointerFromSelectMenu(), registerShortcut(), useDeviceInfo()

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (8): canScheduleCategoryDeletion(), formatDeletionDate(), onConfirmAction(), onCreateCategory(), parseApiMessage(), pushNotification(), resolveCategoryStatus(), runRowAction()

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (7): coerceMuiColor(), isMuiColor(), refreshMuiTheme(), resolveMuiModeFromDom(), resolveMuiPaletteFromCss(), selectNotifications(), createAppStore()

### Community 21 - "Community 21"
Cohesion: 0.3
Nodes (9): createEmptyForm(), createFormFromItem(), onConfirmDisableSlider(), onCreateSlider(), onSaveSliderEdits(), parseApiMessage(), toDateTimeLocal(), toIsoOrUndefined() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (3): onConfirmModeration(), parseApiMessage(), Skeleton()

### Community 23 - "Community 23"
Cohesion: 0.27
Nodes (7): getThemeRuntimeData(), RootLayout(), buildThemeVariables(), normalizeHexColor(), resolveCustomThemeColor(), resolveThemeMode(), MuiEmotionCacheProvider()

### Community 24 - "Community 24"
Cohesion: 0.36
Nodes (8): fillAggregateStats(), fillApps(), fillAppTypes(), fillCategories(), generateIconUrl(), main(), pickColor(), pickFeatureGraphic()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (5): CarouselContent(), CarouselIndicator(), CarouselIndicatorGroup(), Trigger(), useCarousel()

### Community 30 - "Community 30"
Cohesion: 0.52
Nodes (5): daysFromNow(), main(), requireEntity(), startOfUtcDay(), syncStatsForApp()

### Community 31 - "Community 31"
Cohesion: 0.33
Nodes (3): ConfirmDialog(), onConfirmRoleChange(), parseApiMessage()

### Community 34 - "Community 34"
Cohesion: 0.6
Nodes (5): buildOpenApiDocument(), collectMountedRoutes(), extractPathParams(), normalizePath(), toOpenApiPath()

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (3): GET(), PATCH(), PUT()

## Knowledge Gaps
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetchServiceData()` connect `Community 1` to `Community 4`, `Community 6`, `Community 8`, `Community 11`, `Community 12`, `Community 23`, `Community 28`?**
  _High betweenness centrality (0.236) - this node is a cross-community bridge._
- **Why does `proxyToService()` connect `Community 7` to `Community 32`, `Community 33`, `Community 1`, `Community 35`, `Community 39`, `Community 40`, `Community 9`, `Community 42`, `Community 10`, `Community 41`, `Community 12`, `Community 29`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `Community 4` to `Community 1`, `Community 2`, `Community 5`, `Community 8`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`, `Community 21`, `Community 22`, `Community 31`?**
  _High betweenness centrality (0.131) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `proxyToService()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`proxyToService()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 40 inferred relationships involving `proxyAdminRoute()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyAdminRoute()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `fetchServiceData()` (e.g. with `getThemeRuntimeData()` and `SettingsPage()`) actually correct?**
  _`fetchServiceData()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `proxyAdminRouteWithParams()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`proxyAdminRouteWithParams()` has 17 INFERRED edges - model-reasoned connections that need verification._