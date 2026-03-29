export type LinkPlatform =
  | "CHROME"
  | "ANDROID"
  | "GITHUB"
  | "WEBSITE"
  | "OTHER";

export type AdminAppLink = {
  id: string;
  appId: string;
  platform: LinkPlatform;
  downloadUrl: string;
  sourceCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toSortedLinks(items: AdminAppLink[]): AdminAppLink[] {
  return [...items].sort((a, b) => a.platform.localeCompare(b.platform));
}

export function upsertLinkByPlatform(
  items: AdminAppLink[],
  nextLink: AdminAppLink,
): AdminAppLink[] {
  const withoutSamePlatform = items.filter(
    (item) => item.platform !== nextLink.platform,
  );

  return toSortedLinks([...withoutSamePlatform, nextLink]);
}

export function replaceLinkById(
  items: AdminAppLink[],
  linkId: string,
  nextLink: AdminAppLink,
): AdminAppLink[] {
  return toSortedLinks(
    items.map((item) => (item.id === linkId ? nextLink : item)),
  );
}

export function removeLinkById(
  items: AdminAppLink[],
  linkId: string,
): AdminAppLink[] {
  return items.filter((item) => item.id !== linkId);
}

export function validateLinkUrls(
  downloadUrl: string,
  sourceCodeUrl: string,
): string | null {
  try {
    new URL(downloadUrl.trim());
    if (sourceCodeUrl.trim()) {
      new URL(sourceCodeUrl.trim());
    }
  } catch {
    return "Provide valid URLs for download and source code fields.";
  }

  return null;
}
