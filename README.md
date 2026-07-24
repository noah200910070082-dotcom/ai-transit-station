# Flux API Console

一个基于 React、Vite 与开源 `new-api` 后端的 AI API 中转站控制台。

[![CI](https://github.com/noah200910070082-dotcom/ai-transit-station/actions/workflows/ci.yml/badge.svg)](https://github.com/noah200910070082-dotcom/ai-transit-station/actions/workflows/ci.yml)
[![Deploy GitHub Pages](https://github.com/noah200910070082-dotcom/ai-transit-station/actions/workflows/pages.yml/badge.svg)](https://github.com/noah200910070082-dotcom/ai-transit-station/actions/workflows/pages.yml)

在线前端预览：[https://noah200910070082-dotcom.github.io/ai-transit-station/](https://noah200910070082-dotcom.github.io/ai-transit-station/)

> GitHub Pages 仅承载静态前端预览，无法运行 `new-api`、数据库或同源 API 代理。完整注册、登录、计费和渠道能力需要按本文档部署 VPS Docker 后端，并通过 Vercel 同源代理提供正式服务。

项目采用 A6API 风格的专业信息密度、Right Code 风格的清晰层级，并保留自己的青绿色产品视觉。登录、注册、令牌、模型、日志、充值、用户和渠道数据均通过真实 `new-api` 接口获取，不使用前端假数据冒充后端。

## 当前功能

- 独立登录与开放注册页面，好友邀请码选填
- 繁体中文、简体中文和英文切换
- 登录后分组左侧导航与响应式移动端抽屉
- 账户总览、真实使用日志与调用统计
- API 令牌创建、列表和删除
- 当前账户可用模型目录
- 余额、兑换码和支付方式配置
- 账户资料与好友邀请数据
- 管理员用户、渠道和系统数据视图
- Vercel 前端代理与本地/VPS Docker 部署文件

## 技术架构

```text
Browser
  -> Vite / Vercel frontend
  -> same-origin /api proxy
  -> new-api on local Docker or VPS Docker
  -> upstream AI providers
```

- 前端：React 18、TypeScript、Vite、Lucide
- 后端：[`QuantumNous/new-api`](https://github.com/QuantumNous/new-api)
- 本地代理：Vite `/api` -> `VITE_DEV_API_TARGET`
- 线上代理：Vercel `/api` -> `NEW_API_ORIGIN`
- 生产部署：前端 Vercel，后端 VPS Docker

## 本地启动

```bash
npm install
npm run dev
```

前端默认地址：

```text
http://127.0.0.1:5173/
```

复制环境变量示例并按需设置后端地址：

```bash
cp .env.example .env
```

Windows PowerShell 可直接创建：

```powershell
Copy-Item .env.example .env
```

## 本地后端

项目将 `new-api` 固定为 Git submodule。首次克隆时执行：

```bash
git clone --recurse-submodules <repository-url>
```

已有仓库补拉子模块：

```bash
git submodule update --init --recursive
```

Docker Desktop 引擎可用后：

```powershell
npm run docker:check
npm run backend:local
```

后端默认地址：

```text
http://localhost:3000
```

## 固定验证

```bash
npm run build
npm run design:check
npm run docker:check
npm audit --audit-level=high
```

## 部署

### Vercel 前端

- Build Command：`npm run build`
- Output Directory：`dist`
- `VITE_API_BASE_URL`：留空，保持同源请求
- `NEW_API_ORIGIN`：VPS 上的 `new-api` HTTPS 地址

### VPS 后端

参考：

- [部署说明](./docs/DEPLOYMENT.md)
- [系统架构](./docs/ARCHITECTURE.md)
- [开发工作流](./docs/WORKFLOW.md)
- [产品设计基准](./PRODUCT.md)

## 开源依赖说明

`vendor/new-api` 指向上游开源项目并保留其原始许可证。使用、修改或对外提供服务前，请阅读上游 AGPL-3.0 许可证及商业授权说明。
