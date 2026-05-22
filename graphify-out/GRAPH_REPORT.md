# Graph Report - elsesourav  (2026-05-18)

## Corpus Check
- 366 files · ~396,722 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 912 nodes · 1392 edges · 47 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]

## God Nodes (most connected - your core abstractions)
1. `proxyAdminRoute()` - 64 edges
2. `proxyToService()` - 61 edges
3. `fetchServiceData()` - 47 edges
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

## Communities (168 total, 18 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (21): startScheduledCategoryDeletionProcessor(), startScheduledDeletionProcessor(), attachRequestId(), getRequestId(), sendFailure(), sendSuccess(), requireAdminRole(), requireInternalToken() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (42): createEmptyForm(), createFormFromItem(), fetchLinksForApp(), fetchMediaForApp(), onConfirmDelete(), onConfirmDeleteLink(), onConfirmDeleteTag(), onCreateApp() (+34 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (32): serviceBaseUrl(), DELETE(), GET(), POST(), POST(), GET(), GET(), failure() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (16): POST(), DELETE(), PATCH(), PUT(), proxyAdminRouteWithParams(), DELETE(), PATCH(), GET() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (16): AppsBannerSlider(), buildDetails(), buildMeta(), formatBannerDate(), ResendVerificationClient(), createEditFormFromItem(), createEmptyForm(), onConfirmDelete() (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (15): GET(), GET(), GET(), POST(), GET(), POST(), proxyToService(), GET() (+7 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (20): POST(), GET(), POST(), GET(), POST(), GET(), PATCH(), GET() (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (11): AdminStoreBannersPage(), AdminContentBlogPage(), AdminCategoriesPage(), AdminThemeConfigsPage(), AdminCustomFieldsPage(), AdminFeedbackPage(), requireAdminContext(), AdminContentPagesPage() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (14): createEmptyPostForm(), createPostFormFromItem(), onConfirmArchivePost(), onConfirmPublishPost(), onCreatePost(), onCreateTag(), onDeleteTag(), onSavePostEdits() (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (9): AdminAppsPage(), HelpPage(), HelpSupportHero(), HelpSupportPage(), copyHeaderIfPresent(), createInternalHeaders(), fetchServiceData(), getErrorMessage() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (8): toExcerpt(), markdownExcerpt(), markdownToPlainText(), generateMetadata(), getBlogPost(), getHelpArticle(), HelpArticlePage(), MarkdownContent()

### Community 11 - "Community 11"
Cohesion: 0.21
Nodes (6): getApiErrorMessage(), handleSubmit(), HelpSupportPaths(), Card(), CardDescription(), CardTitle()

### Community 12 - "Community 12"
Cohesion: 0.24
Nodes (9): applyConfigPatch(), createEmptyThemeForm(), normalizeHexColor(), onConfirmActivate(), onCreateConfig(), onSaveConfigEdits(), parseApiMessage(), ThemePreview() (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (6): onConfirmModeration(), parseApiMessage(), Badge(), ConfirmDialog(), onConfirmRoleChange(), parseApiMessage()

### Community 14 - "Community 14"
Cohesion: 0.17
Nodes (7): AdminCustomFieldsClient(), buildDefinitionPayload(), formatJsonForEditor(), formatJsonInline(), parseOptionalJson(), parseRequiredJson(), toDefinitionForm()

### Community 15 - "Community 15"
Cohesion: 0.26
Nodes (11): createBannerFormFromItem(), createEmptyBannerForm(), getPlacementDateLabel(), normalizeBannerLinkUrl(), onConfirmDisableBanner(), onCreateBanner(), onSaveBannerEdits(), parseApiMessage() (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (8): canScheduleCategoryDeletion(), formatDeletionDate(), onConfirmAction(), onCreateCategory(), parseApiMessage(), pushNotification(), resolveCategoryStatus(), runRowAction()

### Community 19 - "Community 19"
Cohesion: 0.28
Nodes (10): clampDeletionDelayDays(), findInvalidCustomThemeField(), fromCustomTheme(), resolveSettingsSectionStatus(), SettingsForm(), toCustomThemePayload(), toDeletionScheduleView(), toNotificationSectionPayload() (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (4): handlePointerDown(), isPointerFromSelectMenu(), registerShortcut(), useDeviceInfo()

### Community 22 - "Community 22"
Cohesion: 0.23
Nodes (7): coerceMuiColor(), isMuiColor(), refreshMuiTheme(), resolveMuiModeFromDom(), resolveMuiPaletteFromCss(), selectNotifications(), createAppStore()

### Community 23 - "Community 23"
Cohesion: 0.3
Nodes (9): createEmptyForm(), createFormFromItem(), onConfirmDisableSlider(), onCreateSlider(), onSaveSliderEdits(), parseApiMessage(), toDateTimeLocal(), toIsoOrUndefined() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.27
Nodes (7): getThemeRuntimeData(), RootLayout(), buildThemeVariables(), normalizeHexColor(), resolveCustomThemeColor(), resolveThemeMode(), MuiEmotionCacheProvider()

### Community 25 - "Community 25"
Cohesion: 0.36
Nodes (8): fillAggregateStats(), fillApps(), fillAppTypes(), fillCategories(), generateIconUrl(), main(), pickColor(), pickFeatureGraphic()

### Community 26 - "Community 26"
Cohesion: 0.31
Nodes (4): requireUserContext(), formatDateTime(), LibraryPage(), SettingsPage()

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (4): HeroShowcase(), formatCompactCount(), formatRating(), pickFirstAvailableUrl()

### Community 30 - "Community 30"
Cohesion: 0.33
Nodes (5): CarouselContent(), CarouselIndicator(), CarouselIndicatorGroup(), Trigger(), useCarousel()

### Community 32 - "Community 32"
Cohesion: 0.52
Nodes (5): daysFromNow(), main(), requireEntity(), startOfUtcDay(), syncStatsForApp()

### Community 35 - "Community 35"
Cohesion: 0.6
Nodes (5): buildOpenApiDocument(), collectMountedRoutes(), extractPathParams(), normalizePath(), toOpenApiPath()

### Community 36 - "Community 36"
Cohesion: 0.7
Nodes (3): isDeletionConfirmationPhraseValid(), normalizeDeletionConfirmationValue(), resolveDeletionSectionStatus()

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetchServiceData()` connect `Community 9` to `Community 2`, `Community 4`, `Community 7`, `Community 40`, `Community 10`, `Community 11`, `Community 16`, `Community 24`, `Community 26`, `Community 28`?**
  _High betweenness centrality (0.227) - this node is a cross-community bridge._
- **Why does `proxyToService()` connect `Community 5` to `Community 33`, `Community 2`, `Community 34`, `Community 37`, `Community 6`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 9`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `Community 26` to `Community 1`, `Community 36`, `Community 4`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 15`, `Community 19`, `Community 23`, `Community 31`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Are the 37 inferred relationships involving `proxyAdminRoute()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyAdminRoute()` has 37 INFERRED edges - model-reasoned connections that need verification._
- **Are the 27 inferred relationships involving `proxyToService()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`proxyToService()` has 27 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `fetchServiceData()` (e.g. with `getThemeRuntimeData()` and `SettingsPage()`) actually correct?**
  _`fetchServiceData()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 15 inferred relationships involving `proxyAdminRouteWithParams()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`proxyAdminRouteWithParams()` has 15 INFERRED edges - model-reasoned connections that need verification._