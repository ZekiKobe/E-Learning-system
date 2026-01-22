/**
 * Converts a thumbnail path to a full URL
 * If the path starts with /uploads, it prepends the backend base URL
 * If it's already a full URL, it returns it as is
 */
export const getImageUrl = (thumbnailPath: string | null | undefined): string | undefined => {
  if (!thumbnailPath) {
    return undefined;
  }

  // If it's already a full URL, return it as is
  if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
    return thumbnailPath;
  }

  // If it starts with /uploads, prepend the backend base URL
  if (thumbnailPath.startsWith('/uploads')) {
    const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';
    // Remove /api from the end to get the base URL
    const baseUrl = API_URL.replace(/\/api$/, '');
    return `${baseUrl}${thumbnailPath}`;
  }

  // Return as is for other relative paths
  return thumbnailPath;
};

