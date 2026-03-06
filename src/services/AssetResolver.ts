'use client';
/**
 * @fileOverview Axiom Frontier - Asset URL Resolution Service
 * Resolves CDN URLs to local paths with fallback support.
 */

export type AssetCategory = 'models' | 'animations' | 'textures' | 'audio';

const LOCAL_DIRS: Record<AssetCategory, string> = {
  models: '/assets/models',
  animations: '/assets/animations',
  textures: '/assets/textures',
  audio: '/assets/audio',
};

/**
 * Resolves a URL to a local path if possible.
 */
export function resolveToLocal(url: string | null | undefined, category: AssetCategory): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/assets/') || url.startsWith('./') || url.startsWith('../')) return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url;

  const filename = url.split('/').pop();
  if (!filename) return url;

  return `${LOCAL_DIRS[category]}/${filename}`;
}

/**
 * Checks if a URL is a CDN/External URL.
 */
export function isCdnUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Returns a prioritized list of URLs for an asset (Local first, then CDN).
 */
export function getUrlsWithFallback(localUrl: string | null | undefined, cdnUrl: string | null | undefined): string[] {
  const urls: string[] = [];
  if (localUrl) urls.push(localUrl);
  if (cdnUrl && cdnUrl !== localUrl) urls.push(cdnUrl);
  return urls;
}