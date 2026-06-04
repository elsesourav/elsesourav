# Graph Report - elsesourav  (2026-06-04)

## Corpus Check
- 428 files · ~475,429 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1109 nodes · 1685 edges · 58 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 194 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]

## God Nodes (most connected - your core abstractions)
1. `proxyToService()` - 79 edges
2. `proxyAdminRoute()` - 71 edges
3. `fetchServiceData()` - 65 edges
4. `proxyAdminRouteWithParams()` - 54 edges
5. `requireAdminContext()` - 43 edges
6. `formatDateTime()` - 34 edges
7. `cn()` - 29 edges
8. `proxyUserRoute()` - 24 edges
9. `Card()` - 21 edges
10. `CardTitle()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `serviceBaseUrl()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/app/admin/control/page.tsx → packages/config/src/env.ts
- `checkServiceHealth()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/app/api/admin/health/route.ts → packages/config/src/env.ts
- `proxyToService()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `fetchServiceData()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `GET()` --calls--> `getRedisClient()`  [INFERRED]
  apps/web/src/app/api/admin/health/route.ts → packages/cache/src/index.ts

## Communities (207 total, 25 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (23): ProfileController, startScheduledCategoryDeletionProcessor(), startScheduledDeletionProcessor(), attachRequestId(), getRequestId(), sendFailure(), sendSuccess(), requireAdminRole() (+15 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (39): serviceBaseUrl(), DELETE(), GET(), POST(), POST(), checkServiceHealth(), GET(), GET() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (39): createFormFromItem(), createEmptyPostForm(), createPostFormFromItem(), onConfirmArchivePost(), onConfirmPublishPost(), onCreatePost(), onCreateTag(), onDeleteTag() (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (18): POST(), DELETE(), GET(), PATCH(), PUT(), proxyAdminRouteWithParams(), DELETE(), PATCH() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (30): createEmptyForm(), fetchLinksForApp(), fetchMediaForApp(), onConfirmDelete(), onConfirmDeleteLink(), onConfirmDeleteTag(), onCreateApp(), onCreateLink() (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (17): GET(), GET(), POST(), GET(), GET(), POST(), GET(), GET() (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.1
Nodes (20): POST(), GET(), POST(), GET(), POST(), POST(), GET(), PATCH() (+12 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (11): applyConfigPatch(), createEmptyThemeForm(), normalizeHexColor(), onConfirmActivate(), onCreateConfig(), onSaveConfigEdits(), parseApiMessage(), ThemePreview() (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (14): AdminLayout(), SignOutButton(), AdminHelpArticlesPage(), AdminStoreBannersPage(), AdminCategoriesPage(), AdminHelpCategoriesPage(), AdminThemeConfigsPage(), AdminFeedbackPage() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.13
Nodes (9): AdminAppsPage(), AdminContentBlogPage(), AdminCustomFieldsPage(), AdminHelpFaqsPage(), HelpPage(), fetchServiceData(), AdminContentBlogPage(), AdminStoreSectionsPage() (+1 more)

### Community 11 - "Community 11"
Cohesion: 0.19
Nodes (6): getApiErrorMessage(), handleSubmit(), HelpSupportPaths(), Card(), CardDescription(), CardTitle()

### Community 12 - "Community 12"
Cohesion: 0.23
Nodes (11): isDeletionConfirmationPhraseValid(), normalizeDeletionConfirmationValue(), resolveDeletionSectionStatus(), clampDeletionDelayDays(), findInvalidCustomThemeField(), resolveSettingsSectionStatus(), toCustomThemePayload(), toDeletionScheduleView() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (4): AppsBannerSlider(), buildDetails(), buildMeta(), formatBannerDate()

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (7): requireUserContext(), formatDateTime(), LibraryPage(), ContentPageCard(), SettingsPage(), fromCustomTheme(), SettingsForm()

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (6): generateMetadata(), getBlogPost(), getHelpArticle(), getPost(), HelpArticlePage(), MarkdownContent()

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (7): AdminCustomFieldsClient(), buildDefinitionPayload(), formatJsonForEditor(), formatJsonInline(), parseOptionalJson(), parseRequiredJson(), toDefinitionForm()

### Community 17 - "Community 17"
Cohesion: 0.26
Nodes (11): createBannerFormFromItem(), createEmptyBannerForm(), getPlacementDateLabel(), normalizeBannerLinkUrl(), onConfirmDisableBanner(), onCreateBanner(), onSaveBannerEdits(), parseApiMessage() (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.2
Nodes (10): canScheduleCategoryDeletion(), formatDeletionDate(), createCategory(), onConfirmAction(), onCreateCategory(), parseApiMessage(), pushNotification(), resolveCategoryStatus() (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (4): onConfirmModeration(), parseApiMessage(), Badge(), Skeleton()

### Community 21 - "Community 21"
Cohesion: 0.24
Nodes (10): createEditFormFromItem(), createEmptyForm(), onConfirmDelete(), onCreateSectionItem(), onSaveSectionItemEdits(), parseApiMessage(), SectionItemCard(), toDateTimeLocal() (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (4): handlePointerDown(), isPointerFromSelectMenu(), registerShortcut(), useDeviceInfo()

### Community 25 - "Community 25"
Cohesion: 0.3
Nodes (9): createEmptyForm(), createFormFromItem(), onConfirmDisableSlider(), onCreateSlider(), onSaveSliderEdits(), parseApiMessage(), toDateTimeLocal(), toIsoOrUndefined() (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.17
Nodes (5): POST(), POST(), POST(), POST(), POST()

### Community 27 - "Community 27"
Cohesion: 0.23
Nodes (7): coerceMuiColor(), isMuiColor(), refreshMuiTheme(), resolveMuiModeFromDom(), resolveMuiPaletteFromCss(), selectNotifications(), createAppStore()

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (7): getThemeRuntimeData(), RootLayout(), buildThemeVariables(), normalizeHexColor(), resolveCustomThemeColor(), resolveThemeMode(), MuiEmotionCacheProvider()

### Community 30 - "Community 30"
Cohesion: 0.36
Nodes (8): fillAggregateStats(), fillApps(), fillAppTypes(), fillCategories(), generateIconUrl(), main(), pickColor(), pickFeatureGraphic()

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (4): HeroShowcase(), formatCompactCount(), formatRating(), pickFirstAvailableUrl()

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (5): CarouselContent(), CarouselIndicator(), CarouselIndicatorGroup(), Trigger(), useCarousel()

### Community 35 - "Community 35"
Cohesion: 0.32
Nodes (3): toExcerpt(), markdownExcerpt(), markdownToPlainText()

### Community 38 - "Community 38"
Cohesion: 0.52
Nodes (5): daysFromNow(), main(), requireEntity(), startOfUtcDay(), syncStatsForApp()

### Community 39 - "Community 39"
Cohesion: 0.38
Nodes (4): getAdminAuthStats(), getAdminCatalogStats(), getAdminUserStats(), AdminPage()

### Community 42 - "Community 42"
Cohesion: 0.6
Nodes (5): buildOpenApiDocument(), collectMountedRoutes(), extractPathParams(), normalizePath(), toOpenApiPath()

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (3): GET(), PATCH(), PUT()

## Knowledge Gaps
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetchServiceData()` connect `Community 10` to `Community 33`, `Community 1`, `Community 35`, `Community 39`, `Community 8`, `Community 9`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 52`, `Community 29`?**
  _High betweenness centrality (0.214) - this node is a cross-community bridge._
- **Why does `proxyToService()` connect `Community 5` to `Community 1`, `Community 37`, `Community 6`, `Community 40`, `Community 41`, `Community 44`, `Community 45`, `Community 53`, `Community 54`, `Community 55`, `Community 26`?**
  _High betweenness centrality (0.170) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `Community 14` to `Community 2`, `Community 35`, `Community 4`, `Community 36`, `Community 7`, `Community 10`, `Community 43`, `Community 12`, `Community 11`, `Community 15`, `Community 16`, `Community 17`, `Community 20`, `Community 21`, `Community 22`, `Community 25`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `proxyToService()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`proxyToService()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 40 inferred relationships involving `proxyAdminRoute()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyAdminRoute()` has 40 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `fetchServiceData()` (e.g. with `getThemeRuntimeData()` and `SettingsPage()`) actually correct?**
  _`fetchServiceData()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `proxyAdminRouteWithParams()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`proxyAdminRouteWithParams()` has 17 INFERRED edges - model-reasoned connections that need verification._