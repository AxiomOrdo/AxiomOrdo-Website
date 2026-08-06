export const APP_BASE_PATH = '/ao-pdf';

export function appPath(path: `/${string}`): string {
  return `${APP_BASE_PATH}${path}`;
}
