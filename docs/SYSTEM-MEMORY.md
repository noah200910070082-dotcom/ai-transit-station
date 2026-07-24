# 系統記憶落地版

我無法修改模型或 Codex App 的真正系統層 memory；本文件和根目錄 `AGENTS.md` 作為此專案的持久工作流記憶。

必須長期遵守：

1. 後端採用 `new-api` 架構。
2. 85% 以上功能用開源輪子。
3. 不造輪子。
4. 不做只有前端的 placeholder。
5. 前端部署到 Vercel。
6. 後端部署到 VPS Docker。
7. 沒有 VPS 先本地 Docker。
8. 沒有 Docker 就安裝 Docker Desktop。
9. UI 使用 Impeccable 做設計流程與反模式檢查。
10. 帶 0 基礎用戶走完整 UI 與部署流程。
11. 前端預設同源 `/api`，本地 Vite proxy，Vercel proxy，後端仍是 `new-api`。
12. 登入、邀請碼註冊、Token、User、Channel 資料都接 `new-api` 真接口。
