export const API_NEXT = '/api';

export const API_AUTH = `${API_NEXT}/auth`;
export const API_AUTH_REGISTER = `/auth/register`;

export const ROOT_PATH = '/';
export const ROOT_AUTH_PATH = '/auth';

export const DASHBOARD_PATH = '/dashboard';
export const ANALYTICS_PATH = '/analytics';
export const HISTORY_PATH = '/history';
export const SETTINGS_PATH = '/settings';

export const LOGIN_PATH = `${ROOT_AUTH_PATH}/login`;
export const REGISTER_PATH = `${ROOT_AUTH_PATH}/register`;

export const privateRoutes = [
  ROOT_PATH,
  DASHBOARD_PATH,
  SETTINGS_PATH,
  HISTORY_PATH,
];
export const publicRoutes = [ROOT_AUTH_PATH, LOGIN_PATH, REGISTER_PATH];
export const authRoutes = [ROOT_AUTH_PATH, LOGIN_PATH, REGISTER_PATH];
