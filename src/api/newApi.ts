export const NEW_API_BASE_URL =
  ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_BASE_URL ??
    "").replace(/\/$/, "");

export function getPublicApiEndpoint(
  configuredValue = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_PUBLIC_API_ENDPOINT,
) {
  const configuredEndpoint = configuredValue?.trim();
  if (configuredEndpoint) {
    return configuredEndpoint.replace(/\/$/, "");
  }

  if (/^https?:\/\//.test(NEW_API_BASE_URL)) {
    return new URL("/v1", NEW_API_BASE_URL).toString().replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:3000/v1`;
  }

  return typeof window === "undefined" ? "/v1" : `${window.location.origin}/v1`;
}

type RequestOptions = RequestInit & {
  skipSuccessCheck?: boolean;
};

const USER_ID_STORAGE_KEY = "uid";

function getStoredUserId() {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(USER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeUserId(id: number) {
  try {
    window.localStorage.setItem(USER_ID_STORAGE_KEY, String(id));
  } catch {
    // The active session still works when storage is unavailable.
  }
}

function clearStoredUserId() {
  try {
    window.localStorage.removeItem(USER_ID_STORAGE_KEY);
  } catch {
    // There is nothing else to clear when storage is unavailable.
  }
}

export type NewApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type NewApiPage<T> = {
  page: number;
  page_size: number;
  total: number;
  items: T[];
};

export type NewApiStatusData = {
  version?: string;
  system_name?: string;
  docs_link?: string;
  setup?: boolean;
  register_enabled?: boolean;
  password_login_enabled?: boolean;
  password_register_enabled?: boolean;
  quota_per_unit?: number;
};

export function getDocumentationUrl(status?: Pick<NewApiStatusData, "docs_link"> | null) {
  return status?.docs_link?.trim() || "https://docs.newapi.pro";
}

export type NewApiUser = {
  id: number;
  username: string;
  display_name?: string;
  role: number;
  status?: number;
  email?: string;
  group?: string;
  quota?: number;
  used_quota?: number;
  request_count?: number;
  aff_code?: string;
  aff_count?: number;
  aff_quota?: number;
  aff_history_quota?: number;
};

export type NewApiLoginData = NewApiUser & {
  require_2fa?: boolean;
};

export type NewApiToken = {
  id: number;
  name: string;
  key?: string;
  status: number;
  group?: string;
  remain_quota?: number;
  used_quota?: number;
  unlimited_quota?: boolean;
  created_time?: number;
  accessed_time?: number;
  expired_time?: number;
  model_limits_enabled?: boolean;
  model_limits?: string;
  allow_ips?: string;
};

export type NewApiChannel = {
  id: number;
  name: string;
  type: number;
  status: number;
  group?: string;
  models?: string;
  response_time?: number;
  balance?: number;
  used_quota?: number;
};

export type ChannelPage = NewApiPage<NewApiChannel> & {
  type_counts?: Record<string, number>;
};

export type NewApiLog = {
  id: number;
  user_id: number;
  created_at: number;
  type: number;
  content?: string;
  username?: string;
  token_name?: string;
  model_name?: string;
  quota?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  use_time?: number;
  is_stream?: boolean;
  channel?: number;
  channel_name?: string;
  group?: string;
  request_id?: string;
};

export type NewApiLogStats = {
  quota: number;
  rpm: number;
  tpm: number;
};

export type NewApiTopupInfo = {
  enable_online_topup: boolean;
  enable_stripe_topup: boolean;
  pay_methods: Array<{
    name: string;
    type: string;
    color?: string;
    min_topup?: number;
    icon?: string;
  }>;
  min_topup: number;
  stripe_min_topup: number;
  amount_options: number[];
  discount: Record<number, number>;
  topup_link?: string;
  enable_redemption?: boolean;
};

export type NewApiTokenInput = {
  name: string;
  remain_quota: number;
  expired_time: number;
  unlimited_quota: boolean;
  model_limits_enabled: boolean;
  model_limits: string;
  allow_ips: string;
  group: string;
  cross_group_retry: boolean;
};

function toApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${NEW_API_BASE_URL}${normalizedPath}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function newApiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const userId = getStoredUserId();
  if (userId && !headers.has("New-Api-User")) {
    headers.set("New-Api-User", userId);
  }

  const response = await fetch(toApiUrl(path), {
    ...options,
    credentials: "include",
    headers,
  });

  const payload = await readJson<NewApiEnvelope<T> | T>(response);

  if (!response.ok) {
    throw new Error(`new-api HTTP ${response.status}`);
  }

  if (
    !options.skipSuccessCheck &&
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as NewApiEnvelope<T>).success === false
  ) {
    throw new Error((payload as NewApiEnvelope<T>).message || "new-api request failed");
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as NewApiEnvelope<T>).data;
  }

  return payload as T;
}

export function getStatus() {
  return newApiRequest<NewApiStatusData>("/api/status");
}

export async function login(username: string, password: string) {
  const user = await newApiRequest<NewApiLoginData>("/api/user/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (user.id) {
    storeUserId(user.id);
  }
  return user;
}

export function registerAccount(username: string, password: string, affCode?: string) {
  const body: { username: string; password: string; aff_code?: string } = {
    username,
    password,
  };

  if (affCode?.trim()) {
    body.aff_code = affCode.trim();
  }

  return newApiRequest<NewApiUser>("/api/user/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function logout() {
  try {
    return await newApiRequest<null>("/api/user/logout");
  } finally {
    clearStoredUserId();
  }
}

export function getSelf() {
  return newApiRequest<NewApiUser>("/api/user/self");
}

export function getAffCode() {
  return newApiRequest<string>("/api/user/aff");
}

export function getTokens() {
  return newApiRequest<NewApiPage<NewApiToken>>("/api/token/?p=1&size=20");
}

export function createToken(input: NewApiTokenInput) {
  return newApiRequest<NewApiToken>("/api/token/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteToken(id: number) {
  return newApiRequest<null>(`/api/token/${id}/`, { method: "DELETE" });
}

export function getUserModels() {
  return newApiRequest<string[]>("/api/user/models");
}

export function getLogs(isAdmin: boolean, query = "") {
  const path = isAdmin ? "/api/log" : "/api/log/self";
  const params = new URLSearchParams(query || "p=1&page_size=20");
  params.set("type", "2");
  return newApiRequest<NewApiPage<NewApiLog>>(`${path}?${params.toString()}`);
}

export function getLogStats(isAdmin: boolean, query = "") {
  const path = isAdmin ? "/api/log/stat" : "/api/log/self/stat";
  return newApiRequest<NewApiLogStats>(`${path}${query ? `?${query}` : ""}`);
}

export function getTopupInfo() {
  return newApiRequest<NewApiTopupInfo>("/api/user/topup/info");
}

export function redeemTopupCode(key: string) {
  return newApiRequest<number>("/api/user/topup", {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

export function getUsers() {
  return newApiRequest<NewApiPage<NewApiUser>>("/api/user/?p=1&page_size=5");
}

export function getChannels() {
  return newApiRequest<ChannelPage>("/api/channel/?p=1&page_size=5&id_sort=true");
}
