# AI 中轉站 API 快速接入

這份文件是第一版 API contract 草案，目標是讓開發者用 OpenAI-compatible 方式快速切到 AI 中轉站。

## Base URL

```text
https://api.example.com
```

本地開發時可先使用：

```text
http://127.0.0.1:8787
```

## 認證

所有請求使用 Bearer Token。

```http
Authorization: Bearer sk_live_xxx
```

## Chat Completions

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "用一句話介紹 AI 中轉站" }
    ],
    "stream": false
  }'
```

## Streaming

```bash
curl https://api.example.com/v1/chat/completions \
  -H "Authorization: Bearer sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      { "role": "user", "content": "生成一份產品命名清單" }
    ],
    "stream": true
  }'
```

## Embeddings

```bash
curl https://api.example.com/v1/embeddings \
  -H "Authorization: Bearer sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": "AI 中轉站是一個多模型 API 閘道"
  }'
```

## Model List

```bash
curl https://api.example.com/v1/models \
  -H "Authorization: Bearer sk_live_xxx"
```

## Usage

```bash
curl https://api.example.com/v1/usage \
  -H "Authorization: Bearer sk_live_xxx"
```

## 統一錯誤格式

```json
{
  "error": {
    "code": "provider_unavailable",
    "message": "The selected model provider is temporarily unavailable.",
    "request_id": "req_123"
  }
}
```

## 第一版錯誤碼

| Code | 說明 |
| --- | --- |
| `invalid_api_key` | API Key 無效或已停用 |
| `insufficient_quota` | 餘額或配額不足 |
| `rate_limited` | 請求超過限流 |
| `model_not_found` | 模型不存在或無權使用 |
| `provider_unavailable` | 上游供應商不可用 |
| `content_rejected` | 內容安全策略拒絕 |
| `internal_error` | 平台內部錯誤 |

## 待確認

- 是否保存完整 prompt，默認建議不保存。
- 是否先只支援 BYOK。
- 模型價格是否按 tokens 即時扣費。
- 供應商錯誤是否要暴露原始錯誤訊息。
