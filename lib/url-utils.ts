/**
 * URL Utilities for flexible URL input handling
 * Normalizes user-friendly URL inputs to full URLs before saving
 */

export type UrlFieldType = 'generic' | 'linkedin' | 'orcid' | 'googleScholar' | 'googleMaps';

/**
 * Check if value is a relative path or anchor
 */
export function isRelativeOrAnchor(value: string): boolean {
  return value.startsWith('/') || value.startsWith('#');
}

/**
 * Check if value already has a protocol (http:// or https://)
 */
export function hasProtocol(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * ORCID pattern: 0000-0000-0000-0000 (4 groups of 4 digits separated by hyphens)
 */
const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{4}$/;

/**
 * Google Scholar user ID pattern: alphanumeric, typically 12 characters
 */
const SCHOLAR_ID_PATTERN = /^[a-zA-Z0-9_-]{8,14}$/;

/**
 * Normalize URL based on field type
 *
 * @param value - The input value from user
 * @param fieldType - Type of URL field (determines normalization rules)
 * @returns Normalized URL or null if empty
 *
 * @example
 * normalizeUrl('in/juanperez', 'linkedin') // => 'https://linkedin.com/in/juanperez'
 * normalizeUrl('0000-0002-1234-5678', 'orcid') // => 'https://orcid.org/0000-0002-1234-5678'
 * normalizeUrl('ABC123xyz', 'googleScholar') // => 'https://scholar.google.com/citations?user=ABC123xyz'
 * normalizeUrl('google.com/path', 'generic') // => 'https://google.com/path'
 * normalizeUrl('#section', 'generic') // => '#section' (unchanged)
 * normalizeUrl('/docs/file.pdf', 'generic') // => '/docs/file.pdf' (unchanged)
 */
export function normalizeUrl(value: string | null | undefined, fieldType: UrlFieldType = 'generic'): string | null {
  // Empty or null values
  if (!value || value.trim() === '') {
    return null;
  }

  const trimmed = value.trim();

  // Relative paths and anchors - return unchanged
  if (isRelativeOrAnchor(trimmed)) {
    return trimmed;
  }

  // Already has protocol - return unchanged
  if (hasProtocol(trimmed)) {
    return trimmed;
  }

  // Handle specific field types
  switch (fieldType) {
    case 'orcid':
      return normalizeOrcid(trimmed);
    case 'linkedin':
      return normalizeLinkedin(trimmed);
    case 'googleScholar':
      return normalizeGoogleScholar(trimmed);
    case 'googleMaps':
    case 'generic':
    default:
      return normalizeGeneric(trimmed);
  }
}

/**
 * Normalize ORCID input
 * Accepts: ORCID ID (0000-0002-1234-5678) or orcid.org URL
 */
function normalizeOrcid(value: string): string {
  // If it's just the ORCID ID
  if (ORCID_PATTERN.test(value)) {
    return `https://orcid.org/${value}`;
  }

  // If it starts with orcid.org
  if (value.toLowerCase().startsWith('orcid.org/')) {
    return `https://${value}`;
  }

  // Otherwise treat as generic URL
  return normalizeGeneric(value);
}

/**
 * Normalize LinkedIn input
 * Accepts: in/username, linkedin.com/in/username, or full URL
 */
function normalizeLinkedin(value: string): string {
  // If it starts with 'in/' (LinkedIn profile path)
  if (value.startsWith('in/')) {
    return `https://linkedin.com/${value}`;
  }

  // If it's linkedin.com/... without protocol
  if (value.toLowerCase().startsWith('linkedin.com/')) {
    return `https://${value}`;
  }

  // If it's www.linkedin.com/... without protocol
  if (value.toLowerCase().startsWith('www.linkedin.com/')) {
    return `https://${value}`;
  }

  // Otherwise treat as generic URL
  return normalizeGeneric(value);
}

/**
 * Normalize Google Scholar input
 * Accepts: Scholar user ID, scholar.google.com URL, or full URL
 */
function normalizeGoogleScholar(value: string): string {
  // If it looks like just a Scholar user ID
  if (SCHOLAR_ID_PATTERN.test(value)) {
    return `https://scholar.google.com/citations?user=${value}`;
  }

  // If it starts with scholar.google.com
  if (value.toLowerCase().startsWith('scholar.google.com/')) {
    return `https://${value}`;
  }

  // Otherwise treat as generic URL
  return normalizeGeneric(value);
}

/**
 * Normalize generic URL
 * Adds https:// prefix if missing
 */
function normalizeGeneric(value: string): string {
  // Remove any accidental www. duplication and normalize
  let normalized = value;

  // If starts with www., add https://
  if (normalized.toLowerCase().startsWith('www.')) {
    return `https://${normalized}`;
  }

  // Otherwise just add https://
  return `https://${normalized}`;
}
