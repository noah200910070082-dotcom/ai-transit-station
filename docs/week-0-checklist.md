# Week 0 執行清單

## 第 1 天：定位

- 選定第一批客戶：開發者、小團隊或企業內部團隊。
- 寫出一句話定位：一個 API Key 接入多家 AI 模型。
- 明確不做：帳號共享、灰色轉發、繞地區限制、非授權轉售。

## 第 2 天：供應商

- 列出可接入模型供應商。
- 記錄成本價、限流、商業條款、資料政策。
- 標記 P0、P1、P2 接入順序。

## 第 3 天：API

- 定義 `/v1/chat/completions`、`/v1/embeddings`、`/v1/models`、`/v1/usage`。
- 定義統一錯誤碼。
- 確定 streaming response 格式。

## 第 4 天：資料表

- users
- api_keys
- providers
- models
- requests
- usage_events
- billing_accounts
- invoices
- audit_logs

## 第 5 天：第一個 Adapter

- 接入一個 OpenAI-compatible provider。
- 完成非 streaming 與 streaming。
- 記錄 tokens、耗時、錯誤碼。

## 第 6 天：計費與限流

- Redis 限流。
- 每日配額。
- 餘額扣減。
- 成本與售價分離記錄。

## 第 7 天：內測

- 找 5 個種子用戶。
- 給測試額度。
- 收集接入痛點、模型需求、價格敏感度。
- 決定第 2 週是否開始做充值。
