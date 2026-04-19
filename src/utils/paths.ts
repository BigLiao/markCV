import path from "node:path";

export function normalizeSlashes(value: string): string {
  return value.replaceAll("\\", "/");
}

export function looksLikePath(value: string): boolean {
  return (
    value.startsWith(".") ||
    value.startsWith("/") ||
    value.includes(path.sep) ||
    value.includes("\\")
  );
}

export function isExternalUrl(value: string): boolean {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(value);
}

export function isSpecialUrl(value: string): boolean {
  return (
    value.startsWith("#") ||
    value.startsWith("data:") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:")
  );
}

export function isLocalAssetReference(value: string): boolean {
  return value.length > 0 && !isExternalUrl(value) && !isSpecialUrl(value);
}

export function extnameOrDefault(filePath: string, fallback = ".bin"): string {
  const ext = path.extname(filePath);
  return ext || fallback;
}

export function toPosixPath(...segments: string[]): string {
  return normalizeSlashes(path.posix.join(...segments.map((segment) => normalizeSlashes(segment))));
}

export function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}
