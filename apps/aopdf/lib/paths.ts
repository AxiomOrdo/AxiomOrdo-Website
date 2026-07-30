export const APP_BASE_PATH = '/aopdf';

export function appPath(path: `/${string}`): string {
  return `${APP_BASE_PATH}${path}`;
}
