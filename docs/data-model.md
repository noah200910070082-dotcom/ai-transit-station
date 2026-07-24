# 資料模型草案

## users

- id
- email
- name
- role
- status
- created_at

## api_keys

- id
- user_id
- name
- key_hash
- key_prefix
- status
- rate_limit_per_minute
- monthly_quota
- created_at
- last_used_at

## providers

- id
- name
- type
- base_url
- status
- priority
- created_at

## models

- id
- provider_id
- public_name
- upstream_name
- input_price_per_1m
- output_price_per_1m
- platform_markup
- supports_streaming
- supports_tools
- status

## requests

- id
- user_id
- api_key_id
- model_id
- provider_id
- request_id
- status
- error_code
- latency_ms
- input_tokens
- output_tokens
- cost_amount
- bill_amount
- created_at

## usage_events

- id
- user_id
- request_id
- event_type
- amount
- currency
- metadata
- created_at

## billing_accounts

- id
- user_id
- balance
- currency
- credit_limit
- status
- updated_at

## audit_logs

- id
- actor_id
- action
- resource_type
- resource_id
- ip_address
- created_at
