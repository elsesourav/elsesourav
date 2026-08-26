# Graph Report - elsesourav  (2026-06-05)

## Corpus Check
- 430 files · ~475,650 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1147 nodes · 1745 edges · 58 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 198 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]

## God Nodes (most connected - your core abstractions)
1. `proxyToService()` - 79 edges
2. `proxyAdminRoute()` - 79 edges
3. `fetchServiceData()` - 66 edges
4. `proxyAdminRouteWithParams()` - 54 edges
5. `requireAdminContext()` - 45 edges
6. `formatDateTime()` - 35 edges
7. `cn()` - 29 edges
8. `proxyUserRoute()` - 24 edges
9. `Card()` - 22 edges
10. `CardTitle()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `serviceBaseUrl()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/app/admin/control/page.tsx → packages/config/src/env.ts
- `checkServiceHealth()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/app/api/admin/health/route.ts → packages/config/src/env.ts
- `resolveServiceUrl()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `proxyToService()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts
- `fetchServiceData()` --calls--> `getServerEnv()`  [INFERRED]
  apps/web/src/lib/service-client.ts → packages/config/src/env.ts

## Communities (210 total, 27 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (56): createEmptyForm(), createFormFromItem(), fetchLinksForApp(), fetchMediaForApp(), onConfirmDelete(), onConfirmDeleteLink(), onConfirmDeleteTag(), onCreateApp() (+48 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (28): ProfileController, startScheduledCategoryDeletionProcessor(), startScheduledDeletionProcessor(), attachRequestId(), getRequestId(), sendFailure(), sendSuccess(), requireAdminRole() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (36): serviceBaseUrl(), DELETE(), GET(), POST(), POST(), checkServiceHealth(), GET(), GET() (+28 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (18): POST(), DELETE(), GET(), PATCH(), PUT(), proxyAdminRouteWithParams(), DELETE(), PATCH() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (21): GET(), POST(), GET(), GET(), POST(), GET(), POST(), proxyToService() (+13 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (19): GET(), POST(), GET(), POST(), GET(), PATCH(), GET(), POST() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (19): getAdminAuthStats(), getAdminCatalogStats(), getAdminUserStats(), AdminPage(), AdminStoreBannersPage(), AdminCategoriesPage(), AdminHelpCategoriesPage(), AdminThemeConfigsPage() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (14): AdminAppsPage(), AdminHelpArticlesPage(), AdminContentBlogPage(), AdminHelpFaqsPage(), HelpSupportHero(), HelpSupportPage(), copyHeaderIfPresent(), createInternalHeaders() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (13): createBannerFormFromItem(), createEmptyBannerForm(), getPlacementDateLabel(), normalizeBannerLinkUrl(), onConfirmDisableBanner(), onCreateBanner(), onSaveBannerEdits(), parseApiMessage() (+5 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (14): createEmptyPostForm(), createPostFormFromItem(), onConfirmArchivePost(), onConfirmPublishPost(), onCreatePost(), onCreateTag(), onDeleteTag(), onSavePostEdits() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (13): isDeletionConfirmationPhraseValid(), normalizeDeletionConfirmationValue(), resolveDeletionSectionStatus(), clampDeletionDelayDays(), findInvalidCustomThemeField(), fromCustomTheme(), resolveSettingsSectionStatus(), SettingsForm() (+5 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (6): getApiErrorMessage(), handleSubmit(), HelpSupportPaths(), Card(), CardDescription(), CardTitle()

### Community 13 - "Community 13"
Cohesion: 0.16
Nodes (6): AppCard(), HeroShowcase(), formatCompactCount(), formatRating(), pickFirstAvailableUrl(), formatPrice()

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (9): applyConfigPatch(), createEmptyThemeForm(), normalizeHexColor(), onConfirmActivate(), onCreateConfig(), onSaveConfigEdits(), parseApiMessage(), ThemePreview() (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.2
Nodes (10): canScheduleCategoryDeletion(), formatDeletionDate(), createCategory(), onConfirmAction(), onCreateCategory(), parseApiMessage(), pushNotification(), resolveCategoryStatus() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (5): requireUserContext(), formatDateTime(), LibraryPage(), SectionItemCard(), SettingsPage()

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (8): toExcerpt(), markdownExcerpt(), markdownToPlainText(), generateMetadata(), getBlogPost(), getHelpArticle(), getPost(), HelpArticlePage()

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (4): handlePointerDown(), isPointerFromSelectMenu(), registerShortcut(), useDeviceInfo()

### Community 21 - "Community 21"
Cohesion: 0.27
Nodes (9): createEditFormFromItem(), createEmptyForm(), onConfirmDelete(), onCreateSectionItem(), onSaveSectionItemEdits(), parseApiMessage(), toDateTimeLocal(), toIsoOrUndefined() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.19
Nodes (5): buildDefinitionPayload(), formatJsonForEditor(), parseOptionalJson(), parseRequiredJson(), toDefinitionForm()

### Community 24 - "Community 24"
Cohesion: 0.23
Nodes (7): coerceMuiColor(), isMuiColor(), refreshMuiTheme(), resolveMuiModeFromDom(), resolveMuiPaletteFromCss(), selectNotifications(), createAppStore()

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (7): applyConfigPatch(), createEmptyImageForm(), onConfirmActivate(), onCreateConfig(), onSaveConfigEdits(), parseApiMessage(), validateImageForm()

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (3): onConfirmModeration(), parseApiMessage(), Skeleton()

### Community 28 - "Community 28"
Cohesion: 0.3
Nodes (9): createEmptyForm(), createFormFromItem(), onConfirmDisableSlider(), onCreateSlider(), onSaveSliderEdits(), parseApiMessage(), toDateTimeLocal(), toIsoOrUndefined() (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.27
Nodes (7): getThemeRuntimeData(), RootLayout(), buildThemeVariables(), normalizeHexColor(), resolveCustomThemeColor(), resolveThemeMode(), MuiEmotionCacheProvider()

### Community 30 - "Community 30"
Cohesion: 0.36
Nodes (8): fillAggregateStats(), fillApps(), fillAppTypes(), fillCategories(), generateIconUrl(), main(), pickColor(), pickFeatureGraphic()

### Community 33 - "Community 33"
Cohesion: 0.28
Nodes (3): buildDetails(), buildMeta(), formatBannerDate()

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (5): CarouselContent(), CarouselIndicator(), CarouselIndicatorGroup(), Trigger(), useCarousel()

### Community 38 - "Community 38"
Cohesion: 0.52
Nodes (5): daysFromNow(), main(), requireEntity(), startOfUtcDay(), syncStatsForApp()

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (3): Badge(), onConfirmRoleChange(), parseApiMessage()

### Community 44 - "Community 44"
Cohesion: 0.4
Nodes (3): GET(), PATCH(), PUT()

## Knowledge Gaps
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fetchServiceData()` connect `Community 7` to `Community 32`, `Community 2`, `Community 35`, `Community 6`, `Community 39`, `Community 9`, `Community 12`, `Community 16`, `Community 17`, `Community 57`, `Community 29`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `proxyToService()` connect `Community 4` to `Community 2`, `Community 5`, `Community 37`, `Community 7`, `Community 41`, `Community 43`, `Community 44`, `Community 48`, `Community 49`, `Community 50`, `Community 51`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `formatDateTime()` connect `Community 16` to `Community 0`, `Community 32`, `Community 40`, `Community 8`, `Community 10`, `Community 11`, `Community 12`, `Community 13`, `Community 14`, `Community 17`, `Community 19`, `Community 21`, `Community 22`, `Community 25`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Are the 35 inferred relationships involving `proxyToService()` (e.g. with `POST()` and `POST()`) actually correct?**
  _`proxyToService()` has 35 INFERRED edges - model-reasoned connections that need verification._
- **Are the 43 inferred relationships involving `proxyAdminRoute()` (e.g. with `GET()` and `POST()`) actually correct?**
  _`proxyAdminRoute()` has 43 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `fetchServiceData()` (e.g. with `getThemeRuntimeData()` and `SettingsPage()`) actually correct?**
  _`fetchServiceData()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 17 inferred relationships involving `proxyAdminRouteWithParams()` (e.g. with `PATCH()` and `DELETE()`) actually correct?**
  _`proxyAdminRouteWithParams()` has 17 INFERRED edges - model-reasoned connections that need verification._