# AI 中轉站工作流

這個專案之後都按同一套流程走。

1. 先確認需求是前端、後端、部署還是資料流。
2. 優先使用開源輪子，避免重造輪子。
3. 後端以 `new-api` 為基礎，不做 placeholder。
4. 本地優先 Docker，沒有 VPS 也先在本機跑通。
5. 正式部署固定為前端 Vercel、後端 VPS Docker。
6. 前端預設打同源 `/api`，本地用 Vite proxy，Vercel 用 `api/[...path].js` 代理到 VPS `new-api`。
7. UI 先走 0 基礎用戶流程，再補高級功能。
8. 每次前端變更跑 `npm run build`。
9. 每次 UI 變更跑 `npm run design:check`。
10. 每次後端部署變更跑 `npm run docker:check`，Docker engine 可用後跑 `npm run backend:local`。
11. 每次新增依賴後跑 `npm audit --audit-level=high`。

## 固定原則

- 不造輪子。
- 85% 以上功能優先接現成開源能力。
- 所有後端能力必須能落地，不接受僅前端假頁。
- 登入、邀請碼註冊、API Key、Channel、User 資料都以 `new-api` 接口為準。
- 任何新的流程都先寫成文檔，再寫進代碼。
- 寫進專案記憶的內容以本文檔為準。

## 已接接口

- `GET /api/status`
- `POST /api/user/login`
- `POST /api/user/register`
- `GET /api/user/self`
- `GET /api/user/aff`
- `GET /api/token/`
- `GET /api/user/` 管理員
- `GET /api/channel/` 管理員
