import type { Metadata } from 'next';
import {
  buildPageMetadata as baseBuildPageMetadata,
  buildAppMetadata as baseBuildAppMetadata,
  buildNoteMetadata as baseBuildNoteMetadata,
  buildHelpArticleMetadata as baseBuildHelpArticleMetadata,
  type PageMetadataOptions,
  type AppMetadataSource,
  type NoteMetadataSource,
  type HelpArticleMetadataSource,
} from '@elsesourav/config';

export type {
  SeoImageDescriptor,
  AppMetadataSource,
  NoteMetadataSource,
  HelpArticleMetadataSource,
  PageMetadataOptions,
} from '@elsesourav/config';

export { toAbsoluteUrl, resolveAppShareImage, resolveNoteShareImage } from '@elsesourav/config';

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  return baseBuildPageMetadata(options) as Metadata;
}

export function buildAppMetadata(app: AppMetadataSource): Metadata {
  return baseBuildAppMetadata(app) as Metadata;
}

export function buildNoteMetadata(post: NoteMetadataSource): Metadata {
  return baseBuildNoteMetadata(post) as Metadata;
}

export function buildHelpArticleMetadata(article: HelpArticleMetadataSource): Metadata {
  return baseBuildHelpArticleMetadata(article) as Metadata;
}
