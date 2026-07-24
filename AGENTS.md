# AI 中轉站專案記憶

本文件是此專案的持久工作流記憶。後續所有 Codex 工作都按這裡執行。

## 固定方向

- 後端系統採用 `new-api` 架構。
- 至少 85% 功能優先使用開源現成輪子。
- 不重造 gateway、計費、限流、審計、帳號池等核心能力。
- 不接受只有前端 placeholder 的假後端。
- Host 方式固定為：前端 Vercel，後端 VPS Docker。
- 沒有 VPS 時先使用本地 Docker deploy。
- Docker 不存在就安裝 Docker Desktop，不繞開。
- 設計流程使用 Impeccable，UI 變更後固定跑檢查。
- 0 基礎用戶流程必須能走通。
- 前端預設同源呼叫 `/api`，本地由 Vite proxy 到 `new-api`，Vercel 由 `api/[...path].js` 轉發到 VPS `NEW_API_ORIGIN`。
- 登入、註冊、Token、Channel、User 資料必須接 `new-api` 真接口，不用前端假資料冒充後端。

## 已落地依賴

- `vendor/new-api`：已拉取 `QuantumNous/new-api`，當前 HEAD `9b9b19e`。
- `impeccable`：已安裝 npm dev dependency，並已安裝 project scope skills 到 `.agents`。
- `deploy/new-api.local.compose.yml`：本地 Docker 部署。
- `deploy/new-api.vps.compose.yml`：VPS Docker 部署。
- `vercel.json`：前端 Vercel 部署。
- `src/api/newApi.ts`：前端對 `new-api` 的薄封裝。
- `api/[...path].js`：Vercel 同源 API 代理，指向 `NEW_API_ORIGIN`。

## 固定驗證

```bash
npm run build
npm run design:check
npm run docker:check
npm audit --audit-level=high
```

Docker engine 可用後：

```bash
npm run backend:local
```

## 當前環境事實

- Docker Desktop 已透過 `winget` 安裝。
- `docker.exe` 位於 `C:\Program Files\Docker\Docker\resources\bin\docker.exe`。
- 當前 shell 無提升權限，無法啟用 WSL / DISM Windows 功能。
- Docker Desktop 需要 WSL2 完成初始化後才能讓本地 compose 跑起來。
