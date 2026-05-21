export const API_NEXT = '/api';

export const API_AUTH = `${API_NEXT}/auth`;
export const API_AUTH_REGISTER = `/auth/register`;
export const API_AUTH_VERIFY_REQUEST = `/auth/verify-request`;
export const API_AUTH_RESEND_VERIFY_REQUEST = `/auth/resend-verify-request`;

export const ROOT_PATH = '/';
export const ROOT_AUTH_PATH = '/auth';

export const DASHBOARD_PATH = '/dashboard';
export const ANALYSIS_PATH = '/analysis';
export const ANALYSIS_DETAIL_PATH = '/analysis/[id]';
export const HISTORY_PATH = '/history';
export const SETTINGS_PATH = '/settings';

export const LOGIN_PATH = `${ROOT_PATH}login`;
export const REGISTER_PATH = `${ROOT_PATH}register`;
export const ROOT_VERIFY_REQUEST_PATH = `${ROOT_PATH}verify-request`;
export const ROOT_CHECK_EMAIL_PATH = `${ROOT_PATH}check-email`;

export const privateRoutes = [
  ROOT_PATH,
  DASHBOARD_PATH,
  SETTINGS_PATH,
  HISTORY_PATH,
  ANALYSIS_PATH,
  ANALYSIS_DETAIL_PATH,
];
export const publicRoutes = [
  ROOT_AUTH_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  ROOT_VERIFY_REQUEST_PATH,
  ROOT_CHECK_EMAIL_PATH,
];
export const authRoutes = [
  ROOT_AUTH_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  ROOT_VERIFY_REQUEST_PATH,
  ROOT_CHECK_EMAIL_PATH,
];
