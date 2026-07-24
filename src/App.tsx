import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Code2,
  Copy,
  CreditCard,
  Database,
  Eye,
  EyeOff,
  FileClock,
  Gift,
  Globe2,
  Home,
  KeyRound,
  Layers3,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  NEW_API_BASE_URL,
  createToken,
  deleteToken,
  getAffCode,
  getChannels,
  getLogStats,
  getLogs,
  getSelf,
  getStatus,
  getTokens,
  getTopupInfo,
  getUserModels,
  getUsers,
  login as newApiLogin,
  logout as newApiLogout,
  redeemTopupCode,
  registerAccount,
  type ChannelPage,
  type NewApiLog,
  type NewApiLogStats,
  type NewApiPage,
  type NewApiStatusData,
  type NewApiToken,
  type NewApiTopupInfo,
  type NewApiUser,
} from "./api/newApi";

type Language = "zh-TW" | "zh-CN" | "en";
type UserRole = "guest" | "member" | "admin";
type AuthenticatedRole = Exclude<UserRole, "guest">;
type BackendStatus = "checking" | "online" | "offline";
type PageKey = "overview" | "logs" | "keys" | "models" | "wallet" | "account" | "admin";
type AuthMode = "login" | "register";

const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
];

const messages = {
  brand: ["流光 API", "流光 API", "Flux API"],
  productTag: ["AI API 控制台", "AI API 控制台", "AI API Console"],
  login: ["登入", "登录", "Sign in"],
  register: ["註冊", "注册", "Create account"],
  loginTitle: ["登入控制台", "登录控制台", "Sign in to console"],
  loginSubtitle: ["使用你的帳號繼續", "使用你的账号继续", "Continue with your account"],
  registerTitle: ["建立帳號", "创建账号", "Create your account"],
  registerSubtitle: ["註冊後將直接進入控制台", "注册后将直接进入控制台", "Enter the console after registration"],
  username: ["帳號", "账号", "Username"],
  usernamePlaceholder: ["輸入帳號", "输入账号", "Enter username"],
  password: ["密碼", "密码", "Password"],
  passwordPlaceholder: ["輸入密碼", "输入密码", "Enter password"],
  confirmPassword: ["確認密碼", "确认密码", "Confirm password"],
  inviteOptional: ["好友邀請碼（選填）", "好友邀请码（选填）", "Referral code (optional)"],
  invitePlaceholder: ["有邀請碼時填寫", "有邀请码时填写", "Enter a code if you have one"],
  signingIn: ["正在登入...", "正在登录...", "Signing in..."],
  creatingAccount: ["正在建立帳號...", "正在创建账号...", "Creating account..."],
  backendOnline: ["服務正常", "服务正常", "Service online"],
  backendOffline: ["後端未連線", "后端未连接", "Backend offline"],
  backendChecking: ["正在檢查服務", "正在检查服务", "Checking service"],
  registrationClosed: ["後端目前未開放註冊", "后端目前未开放注册", "Registration is disabled by the backend"],
  needCredentials: ["請填寫帳號與密碼", "请填写账号与密码", "Enter your username and password"],
  passwordMismatch: ["兩次輸入的密碼不一致", "两次输入的密码不一致", "Passwords do not match"],
  requestFailed: ["請求失敗，請稍後再試", "请求失败，请稍后再试", "Request failed. Try again shortly."],
  require2fa: ["此帳號需要完成兩步驗證", "此账号需要完成两步验证", "This account requires two-factor authentication"],
  app: ["工作台", "工作台", "Workspace"],
  developer: ["開發工具", "开发工具", "Developer"],
  accountGroup: ["帳戶", "账户", "Account"],
  management: ["管理", "管理", "Management"],
  overview: ["總覽", "总览", "Overview"],
  logs: ["使用日誌", "使用日志", "Usage logs"],
  keys: ["API 令牌", "API 令牌", "API keys"],
  models: ["模型廣場", "模型广场", "Models"],
  wallet: ["充值中心", "充值中心", "Wallet"],
  account: ["帳戶設定", "账户设置", "Account settings"],
  admin: ["數據管理", "数据管理", "Data management"],
  overviewTitle: ["控制台總覽", "控制台总览", "Console overview"],
  overviewDesc: ["查看帳戶用量、服務狀態與最近呼叫", "查看账户用量、服务状态与最近调用", "Monitor usage, service health, and recent requests"],
  logsTitle: ["使用日誌", "使用日志", "Usage logs"],
  logsDesc: ["按模型、令牌與請求編號查詢真實呼叫記錄", "按模型、令牌与请求编号查询真实调用记录", "Search real requests by model, key, or request ID"],
  keysTitle: ["API 令牌", "API 令牌", "API keys"],
  keysDesc: ["建立並管理用於呼叫模型的存取令牌", "创建并管理用于调用模型的访问令牌", "Create and manage access keys for model requests"],
  modelsTitle: ["可用模型", "可用模型", "Available models"],
  modelsDesc: ["此帳戶目前可透過 API 呼叫的模型", "此账户目前可通过 API 调用的模型", "Models currently available to this account"],
  walletTitle: ["充值中心", "充值中心", "Wallet"],
  walletDesc: ["查看餘額、兌換額度與後端開放的付款方式", "查看余额、兑换额度与后端开放的付款方式", "Review balance, redeem credit, and use available payment methods"],
  accountTitle: ["帳戶設定", "账户设置", "Account settings"],
  accountDesc: ["管理個人資料、連線資訊與好友邀請", "管理个人资料、连接信息与好友邀请", "Manage profile, connection details, and referrals"],
  adminTitle: ["管理員數據", "管理员数据", "Administration"],
  adminDesc: ["管理使用者、上游渠道與系統運作資料", "管理用户、上游渠道与系统运行数据", "Manage users, upstream channels, and system data"],
  remainingQuota: ["剩餘額度", "剩余额度", "Remaining credit"],
  usedQuota: ["已用額度", "已用额度", "Credit used"],
  requestCount: ["請求次數", "请求次数", "Requests"],
  keyCount: ["API 令牌", "API 令牌", "API keys"],
  cost: ["篩選期間消耗", "筛选期间消耗", "Filtered cost"],
  rpm: ["每分鐘請求", "每分钟请求", "RPM"],
  tpm: ["每分鐘 Token", "每分钟 Token", "TPM"],
  quickStart: ["快速開始", "快速开始", "Quick start"],
  apiEndpoint: ["API 端點", "API 端点", "API endpoint"],
  apiEndpointNote: ["相容 OpenAI SDK 與常見客戶端", "兼容 OpenAI SDK 与常见客户端", "Compatible with OpenAI SDKs and common clients"],
  copy: ["複製", "复制", "Copy"],
  copied: ["已複製", "已复制", "Copied"],
  documentation: ["API 文件", "API 文档", "API guide"],
  recentActivity: ["最近呼叫", "最近调用", "Recent activity"],
  viewAll: ["查看全部", "查看全部", "View all"],
  announcements: ["服務狀態", "服务状态", "Service status"],
  systemVersion: ["系統版本", "系统版本", "System version"],
  connected: ["已連線至 new-api", "已连接至 new-api", "Connected to new-api"],
  noData: ["目前沒有資料", "目前没有数据", "No data yet"],
  noLogs: ["沒有符合條件的呼叫記錄", "没有符合条件的调用记录", "No requests match these filters"],
  noKeys: ["尚未建立 API 令牌", "尚未创建 API 令牌", "No API keys created yet"],
  noModels: ["後端沒有回傳可用模型", "后端没有返回可用模型", "The backend returned no available models"],
  unavailable: ["暫無資料", "暂无数据", "Unavailable"],
  loading: ["正在載入資料...", "正在加载数据...", "Loading data..."],
  refresh: ["重新整理", "刷新", "Refresh"],
  search: ["查詢", "查询", "Search"],
  reset: ["重設", "重置", "Reset"],
  model: ["模型", "模型", "Model"],
  token: ["令牌", "令牌", "Key"],
  requestId: ["請求 ID", "请求 ID", "Request ID"],
  group: ["分組", "分组", "Group"],
  time: ["時間", "时间", "Time"],
  status: ["狀態", "状态", "Status"],
  tokens: ["Token 用量", "Token 用量", "Tokens"],
  latency: ["耗時", "耗时", "Latency"],
  stream: ["串流", "流式", "Stream"],
  createKey: ["建立令牌", "创建令牌", "Create key"],
  keyName: ["令牌名稱", "令牌名称", "Key name"],
  keyNamePlaceholder: ["例如：我的應用", "例如：我的应用", "For example: My app"],
  create: ["建立", "创建", "Create"],
  cancel: ["取消", "取消", "Cancel"],
  delete: ["刪除", "删除", "Delete"],
  deleteConfirm: ["確定要刪除此令牌嗎？", "确定要删除此令牌吗？", "Delete this API key?"],
  name: ["名稱", "名称", "Name"],
  quota: ["額度", "额度", "Quota"],
  lastUsed: ["最後使用", "最后使用", "Last used"],
  never: ["從未", "从未", "Never"],
  enabled: ["啟用", "启用", "Enabled"],
  disabled: ["停用", "停用", "Disabled"],
  searchModels: ["搜尋模型名稱", "搜索模型名称", "Search model names"],
  modelProvider: ["提供者", "提供商", "Provider"],
  access: ["存取方式", "访问方式", "Access"],
  chatApi: ["Chat Completions API", "Chat Completions API", "Chat Completions API"],
  redeemCode: ["兌換碼", "兑换码", "Redemption code"],
  redeemPlaceholder: ["輸入兌換碼", "输入兑换码", "Enter redemption code"],
  redeem: ["立即兌換", "立即兑换", "Redeem"],
  paymentMethods: ["付款方式", "付款方式", "Payment methods"],
  paymentDisabled: ["系統目前未開放線上充值，可使用兌換碼或聯絡管理員。", "系统目前未开放在线充值，可使用兑换码或联系管理员。", "Online top-up is disabled. Use a redemption code or contact an administrator."],
  referral: ["好友邀請", "好友邀请", "Referrals"],
  referralCode: ["我的邀請碼", "我的邀请码", "My referral code"],
  invitedUsers: ["已邀請人數", "已邀请人数", "Invited users"],
  referralQuota: ["邀請獎勵", "邀请奖励", "Referral credit"],
  profile: ["帳戶資料", "账户资料", "Profile"],
  apiConnection: ["API 連線", "API 连接", "API connection"],
  userId: ["使用者 ID", "用户 ID", "User ID"],
  usernameLabel: ["使用者名稱", "用户名", "Username"],
  userGroup: ["帳戶分組", "账户分组", "Account group"],
  role: ["角色", "角色", "Role"],
  member: ["一般使用者", "普通用户", "Member"],
  administrator: ["管理員", "管理员", "Administrator"],
  users: ["使用者", "用户", "Users"],
  channels: ["上游渠道", "上游渠道", "Channels"],
  totalUsers: ["使用者總數", "用户总数", "Total users"],
  totalChannels: ["渠道總數", "渠道总数", "Total channels"],
  email: ["電子郵件", "电子邮箱", "Email"],
  channelType: ["類型", "类型", "Type"],
  balance: ["餘額", "余额", "Balance"],
  logout: ["登出", "退出登录", "Sign out"],
  closeMenu: ["關閉選單", "关闭菜单", "Close menu"],
  openMenu: ["開啟選單", "打开菜单", "Open menu"],
  theme: ["切換主題", "切换主题", "Toggle theme"],
  registered: ["註冊成功，正在登入", "注册成功，正在登录", "Account created. Signing in."],
  loginSuccess: ["登入成功", "登录成功", "Signed in successfully"],
  redeemed: ["兌換成功，已更新帳戶額度", "兑换成功，已更新账户额度", "Code redeemed and balance refreshed"],
  keyCreated: ["令牌已建立", "令牌已创建", "API key created"],
  keyDeleted: ["令牌已刪除", "令牌已删除", "API key deleted"],
} as const;

type MessageKey = keyof typeof messages;

const languageIndex: Record<Language, 0 | 1 | 2> = { "zh-TW": 0, "zh-CN": 1, en: 2 };

function resolveRole(user?: Pick<NewApiUser, "role"> | null): AuthenticatedRole {
  return user && user.role >= 10 ? "admin" : "member";
}

function formatNumber(value: number | undefined, language: Language, fallback: string) {
  return typeof value === "number" ? value.toLocaleString(language) : fallback;
}

function formatQuota(value: number | undefined, unit: number | undefined, language: Language, fallback: string) {
  if (typeof value !== "number") return fallback;
  if (unit && unit > 0) {
    return new Intl.NumberFormat(language, { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(value / unit);
  }
  return value.toLocaleString(language);
}

function formatDate(value: number | undefined, language: Language, fallback: string) {
  if (!value) return fallback;
  const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;
  return new Intl.DateTimeFormat(language, { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(timestamp);
}

function providerFromModel(model: string) {
  const normalized = model.toLowerCase();
  if (normalized.includes("claude")) return "Anthropic";
  if (normalized.includes("gemini")) return "Google";
  if (normalized.includes("deepseek")) return "DeepSeek";
  if (normalized.includes("qwen")) return "Alibaba";
  if (normalized.includes("grok")) return "xAI";
  if (normalized.includes("llama")) return "Meta";
  if (normalized.includes("mistral")) return "Mistral";
  return "OpenAI-compatible";
}

function readableError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  if (/502|bad gateway|failed to fetch|network/i.test(error.message)) return fallback;
  return error.message;
}

function MetricCard({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note?: string }) {
  return (
    <article className="metricCard">
      <div className="metricIcon"><Icon size={18} /></div>
      <div><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</div>
    </article>
  );
}

function EmptyState({ icon: Icon = Database, title, action }: { icon?: LucideIcon; title: string; action?: ReactNode }) {
  return <div className="emptyState"><Icon size={22} /><p>{title}</p>{action}</div>;
}

function StatusTag({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <span className={`statusTag ${enabled ? "success" : "muted"}`}><span />{children}</span>;
}

function App() {
  const [language, setLanguage] = useState<Language>("zh-TW");
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activePage, setActivePage] = useState<PageKey>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [statusData, setStatusData] = useState<NewApiStatusData | null>(null);
  const [currentUser, setCurrentUser] = useState<NewApiUser | null>(null);
  const [tokensPage, setTokensPage] = useState<NewApiPage<NewApiToken> | null>(null);
  const [logsPage, setLogsPage] = useState<NewApiPage<NewApiLog> | null>(null);
  const [logStats, setLogStats] = useState<NewApiLogStats | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [topupInfo, setTopupInfo] = useState<NewApiTopupInfo | null>(null);
  const [usersPage, setUsersPage] = useState<NewApiPage<NewApiUser> | null>(null);
  const [channelsPage, setChannelsPage] = useState<ChannelPage | null>(null);
  const [affCode, setAffCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackTone, setFeedbackTone] = useState<"success" | "error">("error");
  const [copied, setCopied] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [logModel, setLogModel] = useState("");
  const [logToken, setLogToken] = useState("");
  const [logRequestId, setLogRequestId] = useState("");
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [redemptionCode, setRedemptionCode] = useState("");

  const tr = (key: MessageKey) => messages[key][languageIndex[language]];
  const isLoggedIn = role !== "guest";
  const isAdmin = role === "admin";
  const apiOrigin = NEW_API_BASE_URL || window.location.origin;
  const appBase = import.meta.env.BASE_URL;
  const quotaUnit = statusData?.quota_per_unit;

  useEffect(() => {
    let active = true;
    async function boot() {
      try {
        const status = await getStatus();
        if (!active) return;
        setStatusData(status);
        setBackendStatus("online");
        try {
          const user = await getSelf();
          if (!active) return;
          const nextRole = resolveRole(user);
          setCurrentUser(user);
          setRole(nextRole);
          await loadWorkspace(nextRole, user);
        } catch {
          // A healthy backend can still have no authenticated session.
        }
      } catch {
        if (active) setBackendStatus("offline");
      }
    }
    boot();
    return () => { active = false; };
  }, []);

  async function loadWorkspace(nextRole: AuthenticatedRole, seedUser?: NewApiUser) {
    setIsLoading(true);
    const admin = nextRole === "admin";
    const coreResults = await Promise.allSettled([
      getSelf(), getAffCode(), getTokens(), getLogs(admin), getLogStats(admin), getUserModels(), getTopupInfo(),
    ]);
    if (coreResults[0].status === "fulfilled") setCurrentUser(coreResults[0].value); else if (seedUser) setCurrentUser(seedUser);
    if (coreResults[1].status === "fulfilled") setAffCode(coreResults[1].value);
    if (coreResults[2].status === "fulfilled") setTokensPage(coreResults[2].value);
    if (coreResults[3].status === "fulfilled") setLogsPage(coreResults[3].value);
    if (coreResults[4].status === "fulfilled") setLogStats(coreResults[4].value);
    if (coreResults[5].status === "fulfilled") setModels(coreResults[5].value ?? []);
    if (coreResults[6].status === "fulfilled") setTopupInfo(coreResults[6].value);
    if (admin) {
      const [usersResult, channelsResult] = await Promise.allSettled([getUsers(), getChannels()]);
      if (usersResult.status === "fulfilled") setUsersPage(usersResult.value);
      if (channelsResult.status === "fulfilled") setChannelsPage(channelsResult.value);
    }
    setIsLoading(false);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    if (!username.trim() || !password) {
      setFeedback(tr("needCredentials"));
      return;
    }
    if (authMode === "register" && password !== confirmPassword) {
      setFeedback(tr("passwordMismatch"));
      return;
    }
    if (backendStatus !== "online") {
      setFeedback(tr("backendOffline"));
      return;
    }
    setIsSubmitting(true);
    try {
      if (authMode === "register") {
        await registerAccount(username.trim(), password, inviteCode.trim());
        setFeedbackTone("success");
        setFeedback(tr("registered"));
      }
      const user = await newApiLogin(username.trim(), password);
      if (user.require_2fa) {
        setFeedbackTone("error");
        setFeedback(tr("require2fa"));
        return;
      }
      const nextRole = resolveRole(user);
      setRole(nextRole);
      setCurrentUser(user);
      setActivePage("overview");
      await loadWorkspace(nextRole, user);
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(readableError(error, tr("requestFailed")));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    try { await newApiLogout(); } catch { /* Local session still resets. */ }
    setRole("guest");
    setCurrentUser(null);
    setTokensPage(null);
    setLogsPage(null);
    setModels([]);
    setTopupInfo(null);
    setUsersPage(null);
    setChannelsPage(null);
    setActivePage("overview");
    setPassword("");
    setConfirmPassword("");
  }

  async function refreshWorkspace() {
    if (role === "guest") return;
    await loadWorkspace(role, currentUser ?? undefined);
  }

  async function searchLogs() {
    setIsLoading(true);
    const params = new URLSearchParams({ p: "1", page_size: "20" });
    if (logModel.trim()) params.set("model_name", logModel.trim());
    if (logToken.trim()) params.set("token_name", logToken.trim());
    if (logRequestId.trim()) params.set("request_id", logRequestId.trim());
    const query = params.toString();
    const [logsResult, statsResult] = await Promise.allSettled([getLogs(isAdmin, query), getLogStats(isAdmin, query)]);
    if (logsResult.status === "fulfilled") setLogsPage(logsResult.value);
    if (statsResult.status === "fulfilled") setLogStats(statsResult.value);
    setIsLoading(false);
  }

  async function handleCreateToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTokenName.trim()) return;
    setIsSubmitting(true);
    try {
      await createToken({
        name: newTokenName.trim(), remain_quota: 0, expired_time: -1, unlimited_quota: true,
        model_limits_enabled: false, model_limits: "", allow_ips: "", group: "", cross_group_retry: false,
      });
      setTokensPage(await getTokens());
      setNewTokenName("");
      setShowTokenDialog(false);
      setFeedbackTone("success");
      setFeedback(tr("keyCreated"));
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(readableError(error, tr("requestFailed")));
    } finally { setIsSubmitting(false); }
  }

  async function handleDeleteToken(id: number) {
    if (!window.confirm(tr("deleteConfirm"))) return;
    try {
      await deleteToken(id);
      setTokensPage(await getTokens());
      setFeedbackTone("success");
      setFeedback(tr("keyDeleted"));
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(readableError(error, tr("requestFailed")));
    }
  }

  async function handleRedeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!redemptionCode.trim()) return;
    setIsSubmitting(true);
    try {
      await redeemTopupCode(redemptionCode.trim());
      setCurrentUser(await getSelf());
      setRedemptionCode("");
      setFeedbackTone("success");
      setFeedback(tr("redeemed"));
    } catch (error) {
      setFeedbackTone("error");
      setFeedback(readableError(error, tr("requestFailed")));
    } finally { setIsSubmitting(false); }
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  const navGroups = useMemo(() => {
    const item = (key: PageKey, icon: LucideIcon, label: string) => ({ key, icon, label });
    return [
      { label: tr("app"), items: [item("overview", Home, tr("overview")), item("logs", FileClock, tr("logs"))] },
      { label: tr("developer"), items: [item("keys", KeyRound, tr("keys")), item("models", Layers3, tr("models"))] },
      { label: tr("accountGroup"), items: [item("wallet", WalletCards, tr("wallet")), item("account", Settings, tr("account"))] },
      ...(isAdmin ? [{ label: tr("management"), items: [item("admin", ShieldCheck, tr("admin"))] }] : []),
    ];
  }, [language, isAdmin]);

  const pageMeta: Record<PageKey, { title: string; description: string }> = {
    overview: { title: tr("overviewTitle"), description: tr("overviewDesc") },
    logs: { title: tr("logsTitle"), description: tr("logsDesc") },
    keys: { title: tr("keysTitle"), description: tr("keysDesc") },
    models: { title: tr("modelsTitle"), description: tr("modelsDesc") },
    wallet: { title: tr("walletTitle"), description: tr("walletDesc") },
    account: { title: tr("accountTitle"), description: tr("accountDesc") },
    admin: { title: tr("adminTitle"), description: tr("adminDesc") },
  };

  const filteredModels = models.filter((model) => model.toLowerCase().includes(modelSearch.toLowerCase()));
  const logRows = logsPage?.items ?? [];
  const tokenRows = tokensPage?.items ?? [];

  function renderLogTable(rows: NewApiLog[], compact = false) {
    if (!rows.length) return <EmptyState icon={FileClock} title={tr("noLogs")} />;
    return (
      <div className="tableScroller">
        <table className="dataTable">
          <thead><tr><th>{tr("time")}</th><th>{tr("model")}</th><th>{tr("token")}</th><th>{tr("tokens")}</th><th>{tr("cost")}</th><th>{tr("latency")}</th>{compact ? null : <th>{tr("requestId")}</th>}</tr></thead>
          <tbody>{rows.map((log) => (
            <tr key={log.id}>
              <td className="nowrap">{formatDate(log.created_at, language, tr("unavailable"))}</td>
              <td><span className="modelName">{log.model_name || tr("unavailable")}</span></td>
              <td>{log.token_name || tr("unavailable")}</td>
              <td>{formatNumber((log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0), language, "0")}</td>
              <td>{formatQuota(log.quota, quotaUnit, language, tr("unavailable"))}</td>
              <td>{typeof log.use_time === "number" ? `${log.use_time.toFixed(2)}s` : tr("unavailable")}</td>
              {compact ? null : <td><code className="requestCode">{log.request_id || "-"}</code></td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }

  function renderOverview() {
    return <>
      <section className="metricGrid">
        <MetricCard icon={CircleDollarSign} label={tr("remainingQuota")} value={formatQuota(currentUser?.quota, quotaUnit, language, tr("unavailable"))} />
        <MetricCard icon={BarChart3} label={tr("usedQuota")} value={formatQuota(currentUser?.used_quota, quotaUnit, language, tr("unavailable"))} />
        <MetricCard icon={Activity} label={tr("requestCount")} value={formatNumber(currentUser?.request_count, language, tr("unavailable"))} />
        <MetricCard icon={KeyRound} label={tr("keyCount")} value={formatNumber(tokensPage?.total, language, tr("unavailable"))} />
      </section>
      <section className="overviewGrid">
        <article className="panel quickStartPanel">
          <div className="panelHeader"><div><span className="eyebrow">OPENAI COMPATIBLE</span><h2>{tr("quickStart")}</h2></div><Code2 size={19} /></div>
          <p>{tr("apiEndpointNote")}</p>
          <div className="endpointBox"><div><span>{tr("apiEndpoint")}</span><code>{apiOrigin}/v1</code></div><button className="iconButton" onClick={() => copyText(`${apiOrigin}/v1`)} title={tr("copy")} type="button">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div>
          <div className="quickActions"><button className="secondaryButton" onClick={() => setActivePage("keys")} type="button"><KeyRound size={16} />{tr("keys")}</button><a className="secondaryButton" href="/docs/api-quickstart.md" target="_blank"><BookOpen size={16} />{tr("documentation")}</a></div>
        </article>
        <article className="panel servicePanel">
          <div className="panelHeader"><div><span className="eyebrow">NEW-API</span><h2>{tr("announcements")}</h2></div><Bell size={19} /></div>
          <div className="serviceStatus"><div className={`serviceDot ${backendStatus}`}><Server size={20} /></div><div><strong>{backendStatus === "online" ? tr("connected") : tr("backendOffline")}</strong><span>{statusData?.system_name || "New API"}</span></div></div>
          <dl className="detailList"><div><dt>{tr("systemVersion")}</dt><dd>{statusData?.version || tr("unavailable")}</dd></div><div><dt>{tr("userGroup")}</dt><dd>{currentUser?.group || "default"}</dd></div></dl>
        </article>
      </section>
      <section className="panel tablePanel">
        <div className="panelHeader"><div><span className="eyebrow">ACTIVITY</span><h2>{tr("recentActivity")}</h2></div><button className="textButton" onClick={() => setActivePage("logs")} type="button">{tr("viewAll")}<ChevronRight size={15} /></button></div>
        {renderLogTable(logRows.slice(0, 6), true)}
      </section>
      <section className="referralStrip"><div className="referralIcon"><Gift size={21} /></div><div><strong>{tr("referral")}</strong><span>{tr("referralCode")}: {affCode || tr("unavailable")}</span></div><button className="secondaryButton" disabled={!affCode} onClick={() => copyText(affCode)} type="button"><Copy size={15} />{tr("copy")}</button></section>
    </>;
  }

  function renderLogs() {
    return <>
      <section className="metricGrid three">
        <MetricCard icon={CircleDollarSign} label={tr("cost")} value={formatQuota(logStats?.quota, quotaUnit, language, tr("unavailable"))} />
        <MetricCard icon={Zap} label={tr("rpm")} value={formatNumber(logStats?.rpm, language, tr("unavailable"))} />
        <MetricCard icon={Activity} label={tr("tpm")} value={formatNumber(logStats?.tpm, language, tr("unavailable"))} />
      </section>
      <section className="panel filterPanel">
        <div className="filterGrid"><label><span>{tr("model")}</span><input value={logModel} onChange={(event) => setLogModel(event.target.value)} placeholder="gpt-4o" /></label><label><span>{tr("token")}</span><input value={logToken} onChange={(event) => setLogToken(event.target.value)} placeholder={tr("keyName")} /></label><label><span>{tr("requestId")}</span><input value={logRequestId} onChange={(event) => setLogRequestId(event.target.value)} placeholder="req_..." /></label><div className="filterActions"><button className="primaryButton" onClick={searchLogs} type="button"><Search size={16} />{tr("search")}</button><button className="secondaryButton" onClick={() => { setLogModel(""); setLogToken(""); setLogRequestId(""); }} type="button">{tr("reset")}</button></div></div>
      </section>
      <section className="panel tablePanel">{renderLogTable(logRows)}</section>
    </>;
  }

  function renderKeys() {
    return <section className="panel tablePanel">
      <div className="panelHeader"><div><span className="eyebrow">ACCESS</span><h2>{tr("keys")}</h2></div><button className="primaryButton" onClick={() => setShowTokenDialog(true)} type="button"><Plus size={16} />{tr("createKey")}</button></div>
      {!tokenRows.length ? <EmptyState icon={KeyRound} title={tr("noKeys")} action={<button className="primaryButton" onClick={() => setShowTokenDialog(true)} type="button"><Plus size={16} />{tr("createKey")}</button>} /> : <div className="tableScroller"><table className="dataTable"><thead><tr><th>{tr("name")}</th><th>{tr("status")}</th><th>{tr("quota")}</th><th>{tr("lastUsed")}</th><th aria-label={tr("delete")} /></tr></thead><tbody>{tokenRows.map((token) => <tr key={token.id}><td><div className="keyNameCell"><KeyRound size={16} /><div><strong>{token.name}</strong><code>{token.key ? `${token.key.slice(0, 8)}••••${token.key.slice(-4)}` : `#${token.id}`}</code></div></div></td><td><StatusTag enabled={token.status === 1}>{token.status === 1 ? tr("enabled") : tr("disabled")}</StatusTag></td><td>{token.unlimited_quota ? "∞" : formatQuota(token.remain_quota, quotaUnit, language, tr("unavailable"))}</td><td>{formatDate(token.accessed_time, language, tr("never"))}</td><td><button className="iconButton danger" onClick={() => handleDeleteToken(token.id)} title={tr("delete")} type="button"><Trash2 size={16} /></button></td></tr>)}</tbody></table></div>}
    </section>;
  }

  function renderModels() {
    return <section className="panel tablePanel">
      <div className="panelHeader responsive"><div><span className="eyebrow">CATALOG</span><h2>{formatNumber(models.length, language, "0")} {tr("models")}</h2></div><label className="searchBox"><Search size={16} /><input value={modelSearch} onChange={(event) => setModelSearch(event.target.value)} placeholder={tr("searchModels")} /></label></div>
      {!filteredModels.length ? <EmptyState icon={Layers3} title={tr("noModels")} /> : <div className="modelList">{filteredModels.map((model) => <div className="modelRow" key={model}><div className="providerMark">{providerFromModel(model).slice(0, 1)}</div><div className="modelIdentity"><strong>{model}</strong><span>{providerFromModel(model)}</span></div><span className="endpointTag">{tr("chatApi")}</span><StatusTag enabled>{tr("enabled")}</StatusTag></div>)}</div>}
    </section>;
  }

  function renderWallet() {
    const onlinePayment = Boolean(topupInfo?.enable_online_topup || topupInfo?.enable_stripe_topup);
    return <>
      <section className="walletHero"><div><span>{tr("remainingQuota")}</span><strong>{formatQuota(currentUser?.quota, quotaUnit, language, tr("unavailable"))}</strong><small>{currentUser?.username}</small></div><WalletCards size={34} /></section>
      <section className="twoColumn">
        <form className="panel formPanel" onSubmit={handleRedeem}><div className="panelHeader"><div><span className="eyebrow">REDEEM</span><h2>{tr("redeemCode")}</h2></div><Gift size={19} /></div><label className="field"><span>{tr("redeemCode")}</span><input value={redemptionCode} onChange={(event) => setRedemptionCode(event.target.value)} placeholder={tr("redeemPlaceholder")} /></label><button className="primaryButton full" disabled={isSubmitting || topupInfo?.enable_redemption === false} type="submit">{tr("redeem")}<ArrowRight size={16} /></button></form>
        <article className="panel"><div className="panelHeader"><div><span className="eyebrow">PAYMENT</span><h2>{tr("paymentMethods")}</h2></div><CreditCard size={19} /></div>{onlinePayment ? <div className="paymentList">{(topupInfo?.pay_methods ?? []).map((method) => <div key={method.type}><CreditCard size={17} /><span>{method.name}</span><small>{method.min_topup ? `Min ${method.min_topup}` : ""}</small></div>)}</div> : <EmptyState icon={CreditCard} title={tr("paymentDisabled")} />}</article>
      </section>
    </>;
  }

  function renderAccount() {
    return <section className="twoColumn accountColumns">
      <article className="panel"><div className="panelHeader"><div><span className="eyebrow">PROFILE</span><h2>{tr("profile")}</h2></div><UserRound size={19} /></div><dl className="settingsList"><div><dt>{tr("userId")}</dt><dd>#{currentUser?.id ?? "-"}</dd></div><div><dt>{tr("usernameLabel")}</dt><dd>{currentUser?.username || "-"}</dd></div><div><dt>{tr("email")}</dt><dd>{currentUser?.email || tr("unavailable")}</dd></div><div><dt>{tr("userGroup")}</dt><dd>{currentUser?.group || "default"}</dd></div><div><dt>{tr("role")}</dt><dd>{isAdmin ? tr("administrator") : tr("member")}</dd></div></dl></article>
      <div className="stackedPanels"><article className="panel"><div className="panelHeader"><div><span className="eyebrow">CONNECTION</span><h2>{tr("apiConnection")}</h2></div><Network size={19} /></div><div className="endpointBox"><div><span>{tr("apiEndpoint")}</span><code>{apiOrigin}/v1</code></div><button className="iconButton" onClick={() => copyText(`${apiOrigin}/v1`)} title={tr("copy")} type="button"><Copy size={17} /></button></div></article><article className="panel referralPanel"><div className="panelHeader"><div><span className="eyebrow">REFERRAL</span><h2>{tr("referral")}</h2></div><Gift size={19} /></div><div className="referralCode"><span>{tr("referralCode")}</span><strong>{affCode || tr("unavailable")}</strong><button className="iconButton" disabled={!affCode} onClick={() => copyText(affCode)} title={tr("copy")} type="button"><Copy size={16} /></button></div><div className="miniMetrics"><div><span>{tr("invitedUsers")}</span><strong>{formatNumber(currentUser?.aff_count, language, "0")}</strong></div><div><span>{tr("referralQuota")}</span><strong>{formatQuota(currentUser?.aff_quota, quotaUnit, language, "0")}</strong></div></div></article></div>
    </section>;
  }

  function renderAdmin() {
    return <>
      <section className="metricGrid three"><MetricCard icon={Users} label={tr("totalUsers")} value={formatNumber(usersPage?.total, language, tr("unavailable"))} /><MetricCard icon={Server} label={tr("totalChannels")} value={formatNumber(channelsPage?.total, language, tr("unavailable"))} /><MetricCard icon={Activity} label={tr("systemVersion")} value={statusData?.version || tr("unavailable")} /></section>
      <section className="panel tablePanel"><div className="panelHeader"><div><span className="eyebrow">USERS</span><h2>{tr("users")}</h2></div><Users size={19} /></div>{!usersPage?.items?.length ? <EmptyState icon={Users} title={tr("noData")} /> : <div className="tableScroller"><table className="dataTable"><thead><tr><th>ID</th><th>{tr("usernameLabel")}</th><th>{tr("email")}</th><th>{tr("group")}</th><th>{tr("quota")}</th><th>{tr("status")}</th></tr></thead><tbody>{usersPage.items.map((user) => <tr key={user.id}><td>#{user.id}</td><td><strong>{user.display_name || user.username}</strong></td><td>{user.email || "-"}</td><td>{user.group || "default"}</td><td>{formatQuota(user.quota, quotaUnit, language, "-")}</td><td><StatusTag enabled={user.status === 1}>{user.status === 1 ? tr("enabled") : tr("disabled")}</StatusTag></td></tr>)}</tbody></table></div>}</section>
      <section className="panel tablePanel"><div className="panelHeader"><div><span className="eyebrow">CHANNELS</span><h2>{tr("channels")}</h2></div><Server size={19} /></div>{!channelsPage?.items?.length ? <EmptyState icon={Server} title={tr("noData")} /> : <div className="tableScroller"><table className="dataTable"><thead><tr><th>ID</th><th>{tr("name")}</th><th>{tr("channelType")}</th><th>{tr("group")}</th><th>{tr("balance")}</th><th>{tr("status")}</th></tr></thead><tbody>{channelsPage.items.map((channel) => <tr key={channel.id}><td>#{channel.id}</td><td><strong>{channel.name}</strong></td><td>Type {channel.type}</td><td>{channel.group || "default"}</td><td>{typeof channel.balance === "number" ? channel.balance.toLocaleString(language) : "-"}</td><td><StatusTag enabled={channel.status === 1}>{channel.status === 1 ? tr("enabled") : tr("disabled")}</StatusTag></td></tr>)}</tbody></table></div>}</section>
    </>;
  }

  function renderPage() {
    if (isLoading && !currentUser) return <EmptyState icon={RefreshCw} title={tr("loading")} />;
    switch (activePage) {
      case "logs": return renderLogs();
      case "keys": return renderKeys();
      case "models": return renderModels();
      case "wallet": return renderWallet();
      case "account": return renderAccount();
      case "admin": return isAdmin ? renderAdmin() : renderOverview();
      default: return renderOverview();
    }
  }

  if (!isLoggedIn) {
    const registrationDisabled = statusData?.password_register_enabled === false;
    const passwordLoginDisabled = statusData?.password_login_enabled === false;
    const statusLabel = backendStatus === "online" ? tr("backendOnline") : backendStatus === "checking" ? tr("backendChecking") : tr("backendOffline");
    return <main className={`authPage ${darkMode ? "dark" : ""}`}>
      <header className="authTop"><a className="authBrand" href={appBase}><span><Network size={21} /></span><strong>{tr("brand")}</strong></a><div className="authTools"><button className="iconButton" onClick={() => setDarkMode((value) => !value)} title={tr("theme")} type="button">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><label className="languageControl"><Globe2 size={16} /><select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div></header>
      <section className="authViewport">
        <div className="authIdentity"><span className="authLogo"><Network size={28} /></span><h1>{tr("brand")}</h1><p>{tr("productTag")}</p></div>
        <form className="authCard" onSubmit={handleAuth}>
          <div className="authTabs"><button className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setFeedback(""); }} type="button">{tr("login")}</button><button className={authMode === "register" ? "active" : ""} disabled={registrationDisabled} onClick={() => { setAuthMode("register"); setFeedback(""); }} type="button">{tr("register")}</button></div>
          <div className="authHeading"><h2>{authMode === "login" ? tr("loginTitle") : tr("registerTitle")}</h2><p>{authMode === "login" ? tr("loginSubtitle") : tr("registerSubtitle")}</p></div>
          <label className="field"><span>{tr("username")}</span><div className="inputWithIcon"><UserRound size={17} /><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder={tr("usernamePlaceholder")} /></div></label>
          <label className="field"><span>{tr("password")}</span><div className="inputWithIcon"><LockKeyhole size={17} /><input autoComplete={authMode === "login" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={tr("passwordPlaceholder")} /><button className="passwordToggle" onClick={() => setShowPassword((value) => !value)} title={showPassword ? "Hide" : "Show"} type="button">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {authMode === "register" ? <><label className="field"><span>{tr("confirmPassword")}</span><div className="inputWithIcon"><ShieldCheck size={17} /><input autoComplete="new-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={tr("confirmPassword")} /></div></label><label className="field"><span>{tr("inviteOptional")}</span><div className="inputWithIcon"><Gift size={17} /><input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder={tr("invitePlaceholder")} /></div></label></> : null}
          <button className="primaryButton authSubmit" disabled={isSubmitting || backendStatus !== "online" || (authMode === "login" && passwordLoginDisabled)} type="submit"><span>{isSubmitting ? (authMode === "login" ? tr("signingIn") : tr("creatingAccount")) : (authMode === "login" ? tr("login") : tr("register"))}</span><ArrowRight size={17} /></button>
          {registrationDisabled && authMode === "login" ? <p className="authNotice">{tr("registrationClosed")}</p> : null}
          {feedback ? <div className={`feedback ${feedbackTone}`}>{feedback}</div> : null}
          <div className={`backendState ${backendStatus}`}><span /><strong>{statusLabel}</strong><small>{statusData?.system_name || "new-api"}</small></div>
        </form>
      </section>
    </main>;
  }

  return <main className={`consoleApp ${darkMode ? "dark" : ""}`}>
    <div className={`sidebarBackdrop ${mobileMenuOpen ? "visible" : ""}`} onClick={() => setMobileMenuOpen(false)} />
    <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
      <div className="sidebarBrand"><span><Network size={21} /></span><div><strong>{tr("brand")}</strong><small>{tr("productTag")}</small></div><button className="iconButton sidebarClose" onClick={() => setMobileMenuOpen(false)} title={tr("closeMenu")} type="button"><X size={18} /></button></div>
      <nav className="sidebarNav">{navGroups.map((group) => <div className="navGroup" key={group.label}><span className="navLabel">{group.label}</span>{group.items.map((item) => { const Icon = item.icon; return <button className={activePage === item.key ? "active" : ""} key={item.key} onClick={() => { setActivePage(item.key); setMobileMenuOpen(false); }} type="button"><Icon size={17} /><span>{item.label}</span>{activePage === item.key ? <ChevronRight size={15} /> : null}</button>; })}</div>)}</nav>
      <div className="sidebarUser"><div className="userAvatar">{(currentUser?.display_name || currentUser?.username || "U").slice(0, 1).toUpperCase()}</div><div><strong>{currentUser?.display_name || currentUser?.username}</strong><span>{isAdmin ? tr("administrator") : currentUser?.group || tr("member")}</span></div><button className="iconButton" onClick={handleLogout} title={tr("logout")} type="button"><LogOut size={17} /></button></div>
    </aside>
    <section className="appStage">
      <header className="topbar"><div className="topbarTitle"><button className="iconButton menuButton" onClick={() => setMobileMenuOpen(true)} title={tr("openMenu")} type="button"><Menu size={19} /></button><div><h1>{pageMeta[activePage].title}</h1><p>{pageMeta[activePage].description}</p></div></div><div className="topbarTools"><button className={`iconButton refreshButton ${isLoading ? "spinning" : ""}`} onClick={refreshWorkspace} title={tr("refresh")} type="button"><RefreshCw size={17} /></button><button className="iconButton" onClick={() => setDarkMode((value) => !value)} title={tr("theme")} type="button">{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button><label className="languageControl"><Globe2 size={16} /><select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>{languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div></header>
      <div className="contentCanvas">{feedback ? <div className={`toast ${feedbackTone}`}><span>{feedback}</span><button onClick={() => setFeedback("")} title="Close" type="button"><X size={15} /></button></div> : null}{renderPage()}</div>
    </section>
    {showTokenDialog ? <div className="modalBackdrop" role="presentation"><form className="modal" onSubmit={handleCreateToken}><div className="modalHeader"><div><span className="eyebrow">ACCESS KEY</span><h2>{tr("createKey")}</h2></div><button className="iconButton" onClick={() => setShowTokenDialog(false)} title={tr("cancel")} type="button"><X size={18} /></button></div><label className="field"><span>{tr("keyName")}</span><input autoFocus value={newTokenName} onChange={(event) => setNewTokenName(event.target.value)} placeholder={tr("keyNamePlaceholder")} /></label><div className="modalActions"><button className="secondaryButton" onClick={() => setShowTokenDialog(false)} type="button">{tr("cancel")}</button><button className="primaryButton" disabled={isSubmitting || !newTokenName.trim()} type="submit"><Plus size={16} />{tr("create")}</button></div></form></div> : null}
  </main>;
}

export default App;
