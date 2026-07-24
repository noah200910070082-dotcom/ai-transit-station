# 部署方案

## 当前本地一键流程

```powershell
npm run backend:local
npm run backend:test
```

`backend:local` 会在首次运行时生成 `deploy/.env.new-api.local`。该文件被 Git 忽略，包含本地 PostgreSQL、Redis、session 和管理员凭证；不要把它上传到 GitHub。

脚本会启动 `new-api`、PostgreSQL 和 Redis，等待 `/api/status` 可用，并在系统尚未初始化时创建本地 root 管理员。管理员账号不会显示在登录页，登录后的后端角色决定是否显示管理入口。

前端使用两类地址：

```env
VITE_API_BASE_URL=
VITE_DEV_API_TARGET=http://localhost:3000
VITE_PUBLIC_API_ENDPOINT=http://localhost:3000/v1
```

- `VITE_API_BASE_URL`：控制台接口前缀；留空时使用同源 `/api`。
- `VITE_DEV_API_TARGET`：Vite 把控制台 `/api` 请求代理到本地 `new-api`。
- `VITE_PUBLIC_API_ENDPOINT`：用户复制到 OpenAI 客户端的模型调用地址，不是前端网址。

Vercel 正式环境必须把 `VITE_PUBLIC_API_ENDPOINT` 设置为 VPS 后端的 HTTPS `/v1` 地址，例如 `https://api.example.com/v1`。

## 本地優先

沒有 VPS 時，先用 Docker 在本機跑 `new-api`。

```powershell
npm run docker:check
npm run backend:local
```

本地前端環境保持：

```bash
VITE_API_BASE_URL=
VITE_DEV_API_TARGET=http://localhost:3000
```

空的 `VITE_API_BASE_URL` 代表前端同源打 `/api`，Vite 會代理到本機 `new-api`。這能讓 `new-api` 的 session cookie 正常工作。

## Windows Docker

本機已安裝 Docker Desktop，但 Docker engine 需要 WSL2。

如果 `npm run docker:check` 顯示 engine 未響應：

1. 用管理員權限打開 PowerShell。
2. 執行 `wsl --install`。
3. 如果系統提示需要啟用 Windows 功能，啟用 WSL 與 Virtual Machine Platform。
4. 重啟 Windows。
5. 打開 Docker Desktop，完成首次初始化。
6. 回到專案執行 `npm run docker:check`。
7. 再執行 `npm run backend:local`。

提升權限 PowerShell 可用：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

然後重啟，再打開 Docker Desktop。

## new-api 服務

來源：`vendor/new-api`

本地 Compose：`deploy/new-api.local.compose.yml`

正式 Compose：`deploy/new-api.vps.compose.yml`

順序：

1. 配置 `deploy/.env.new-api.example`，正式環境改成 `.env.new-api`。
2. 啟動 `redis`、`postgres`。
3. 啟動 `new-api`。
4. 打開 `/api/status`。
5. 完成 `new-api` 初始化與第一個 root/admin 帳號。
6. 回前端用同一組帳號登入。

確認：

```text
http://localhost:3000/api/status
```

## VPS Docker

VPS 上：

```bash
cp deploy/.env.new-api.example .env.new-api
docker compose -f deploy/new-api.vps.compose.yml --env-file .env.new-api up -d
```

`.env.new-api` 至少要改：

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `SESSION_SECRET`
- `FRONTEND_BASE_URL`

## Vercel 前端

Vercel 使用：

- Build Command: `npm run build`
- Output Directory: `dist`
- `VITE_API_BASE_URL` 留空。
- `NEW_API_ORIGIN` 填 VPS 後端 origin，例如 `https://api.your-domain.com`。

前端會請求同源 `/api/*`，`api/[...path].js` 會轉發到 `NEW_API_ORIGIN/api/*`。

這個方式比前端直接跨域打後端更穩，因為 `new-api` session cookie 預設是 strict，同源代理能避免登入狀態丟失。

## 0 基礎用戶流程

1. 打開前端。
2. 確認登入頁顯示 `new-api 已連線`。
3. 沒有帳號先到 `new-api` 初始化 root/admin，或用邀請碼通道註冊。
4. 用 `new-api` 帳號登入。
5. 普通用戶進工作區，看自己的 API Key、額度、邀請碼。
6. 管理員進管理中心，看全部用戶與上游通道。
7. 生成 API Key、配置 Channel、測試模型。
8. 看用量、審計、帳務與告警。
