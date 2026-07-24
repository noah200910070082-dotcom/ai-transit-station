# AI 中转站前端开源参考研究

研究日期：2026-07-24。

本项目只学习信息架构、交互模式和工程做法，不复制参考项目的品牌、文案或专有资产。后端继续固定使用 `new-api`，前端继续使用 React、TypeScript、Vite 和 Lucide。

## 重点参考

### QuantumNous/new-api

- GitHub：<https://github.com/QuantumNous/new-api>
- 用途：后端、接口契约、权限、计费、日志、渠道和管理员能力的唯一基准。
- 值得学习：按功能拆分的管理表格、Token 遮罩、用户角色驱动导航、完整空状态、同一套用户/管理员数据模型。
- 已采用：`New-Api-User` 身份头、真实 session、消费日志 `type=2`、用户/渠道/Token/模型接口、Docker 部署。

### Wei-Shaw/sub2api

- GitHub：<https://github.com/Wei-Shaw/sub2api>
- 用途：用户控制台和高密度运营页面的主要体验参考。
- 值得学习：总览拆成指标、趋势、近期使用和快速操作；日志页集中日期、模型、密钥、分组筛选；管理员页面把监控和资源管理分开。
- 已采用：总览保持轻量，复杂筛选留在日志页；空数据明确说明；邀请内容位于账户内容而不是侧栏。
- 暂不采用：订阅套餐、订单和支付流程，等实际商业规则确认后再接 `new-api` 现有能力。

### Wei-Shaw/claude-relay-service

- GitHub：<https://github.com/Wei-Shaw/claude-relay-service>
- 用途：账号池健康度、余额预警和运行状态的管理员参考。
- 值得学习：把正常、异常、限流、低余额直接变成可扫描状态；状态信息靠文本和图标共同表达。
- 暂不采用：大面积多色渐变指标卡。本项目保留冷白、浅灰和青绿色的克制主题。

### qixing-jk/all-api-hub

- GitHub：<https://github.com/qixing-jk/all-api-hub>
- 用途：大量站点、账号和密钥的聚合管理参考。
- 值得学习：TanStack Table、虚拟列表、React Query、可复用空状态、完整 i18n、批量操作和账号验证历史。
- 后续采用条件：当单页数据超过 100 行或需要缓存/重试时，再引入 TanStack Query/Table；当前数据量不需要提前增加复杂度。

### songquanpeng/one-api

- GitHub：<https://github.com/songquanpeng/one-api>
- 用途：旧版接口和部署兼容性参考。
- 结论：功能覆盖完整，但视觉与交互不作为当前主方向。

## 本轮落地

- 修复新版 `new-api` 登录后必须携带 `New-Api-User` 的真实兼容问题。
- 注册、登录、刷新恢复 session、Token 创建/列表/删除均使用真实接口。
- 使用日志固定读取消费类型 `type=2`，不再把登录审计显示成模型调用。
- 模型调用端点与控制台 API 地址分离，通过 `VITE_PUBLIC_API_ENDPOINT` 配置。
- 本地部署自动生成 Git 忽略的数据库、Redis、session 和管理员密钥。
- 本地部署自动等待后端就绪，并只在首次运行时初始化 root 管理员。
- 新增后端端到端测试，覆盖状态、管理员、注册、普通用户、Token、模型、日志、用户和渠道。

## 下一阶段

1. 接入真实上游 Channel 后增加模型可用性和延迟状态。
2. 日志数据量增长后增加服务端分页、时间范围、列设置和 CSV 导出。
3. 管理员页面逐步增加用户启停、额度调整、渠道新增/测试等 `new-api` 原生操作。
4. 有真实消费数据后再加入趋势图，避免空图表和演示数字。
5. VPS 就绪后设置 HTTPS、`SESSION_COOKIE_SECURE=true`、备份、监控和 Vercel 环境变量。
