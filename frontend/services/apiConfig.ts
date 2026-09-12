/**
 * API Base URL - directly reads from .env configuration
 */
export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://192.168.137.218:8081';
  return url.replace(/\/$/, '');
}

export const API_BASE_URL = getApiBaseUrl();
