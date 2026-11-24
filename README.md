# Beauty Ritual — Cloudie Edition

> 每日一张灵感卡，一只陪伴你的幽灵伙伴，一套属于你的柔和仪式。
> 为 **L'Oréal Brandstorm 2027** 打造的互动原型 —— 把「美」从一句口号，变成每天两分钟、看得见的小仪式。

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)]()
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)]()
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)]()
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

---

## 目录

- [项目概述](#项目概述)
- [核心功能](#核心功能)
- [技术架构](#技术架构)
- [技术亮点](#技术亮点)
- [快速开始](#快速开始)
- [两种运行模式](#两种运行模式)
- [API 一览](#api-一览)
- [项目结构](#项目结构)
- [赛事信息](#赛事信息)
- [许可证](#许可证)

---

## 项目概述

**Beauty Ritual** 是一个面向年轻用户的「每日自我关照」互动原型。用户每天抽一张塔罗式情绪卡，认识一位 Cloudie 幽灵伙伴，并获得一套由该卡生成的三步仪式（舒展呼吸 / 护肤 / 香氛探索），逐项打卡完成。

产品在 Brandstorm 命题下回应一个洞察：**年轻人想要的不是更多功效承诺，而是一个能坚持、有陪伴感的日常仪式**。我们用「抽卡 + 收集 + 打卡」的游戏化机制，把护肤这件小事变得轻盈、可期待、可沉淀。

这是一个可运行的全栈成品：前端 React 单页应用 + 后端 Node.js REST API + SQLite 持久化。同时保留纯前端离线模式，便于无损演示。

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 🎴 每日灵感卡 | 每天一张情绪卡（The Sun / Moon / Star / Temperance），服务端保证一天仅一次 |
| 👻 Cloudie 伙伴 | 抽卡后领取专属幽灵伙伴，带拟人化对话与「Tell me more」多轮互动 |
| 🌿 三步仪式 | 按当日卡片生成舒展、护肤、香氛三个步骤，可逐项打卡 |
| 🖼️ 幽灵图鉴 | 8 款可收集伙伴，含 Rare / Special / Secret 隐藏款，未解锁显示剪影 |
| 🔥 连续天数 | 记录每日首次抽卡的连续天数，配合最近 7 天打卡圆点 |
| 🔒 隐私优先 | 无需注册；接口以匿名 `userId` 区分，不收集任何个人身份信息 |

## 技术架构

```
┌──────────────────────┐         HTTP/JSON          ┌────────────────────────┐
│  React + Vite 前端    │  ──────────────────────▶   │  Express 后端 (REST)    │
│  src/main.jsx         │  ◀──────────────────────   │  src/routes/api.js      │
└──────────────────────┘       state JSON           └───────────┬────────────┘
          │                                                     │
          │ 未配置 VITE_API_BASE 时                               │ better-sqlite3
          │ 自动降级为 localStorage                               ▼
          ▼                                          ┌────────────────────────┐
   localStorage（离线演示）                           │  SQLite 数据库          │
                                                     │  users / draws /        │
                                                     │  collection / ritual_log │
                                                     └────────────────────────┘
```

- **前端**：React 18 + Vite，lucide-react 图标，全部逻辑集中在 `src/main.jsx`，零 UI 框架依赖。
- **后端**：Node.js + Express 4，ESM 模块，better-sqlite3 嵌入式数据库（无需单独部署数据库服务）。
- **适配层**：`src/api.js` 根据 `VITE_API_BASE` 环境变量智能切换「前后端分离」与「纯前端离线」两种模式。

## 技术亮点

1. **服务端权威规则**：一天一次抽卡由数据库 `(user_id, date)` 唯一约束保证；隐藏款概率由服务端按 12% 裁决，客户端无法伪造 —— 相比原纯前端原型（规则可被绕过），这是从「演示」到「可用」的关键升级。
2. **双模式无缝降级**：同一份前端代码，配置后端地址即走真接口，不配置则自动用 localStorage，单文件版双击即开。演示与开发互不干扰。
3. **状态契约对齐**：后端 `/api/state` 返回结构与前端状态字段一一对应，前端拿到即渲染，无额外转换层；`applyState()` 单点同步，交互逻辑清晰。
4. **零外部服务依赖**：SQLite 嵌入式存储，一条 `npm start` 即可跑起完整后端，答辩现场无需数据库配置。
5. **游戏化闭环**：抽卡 → 领取 → 打卡 → 解锁图鉴 → 连续天数，五步形成完整的正反馈循环，8/8 图鉴均可获得（含隐藏款）。

## 快速开始

### 环境要求

- Node.js 18+（推荐 20/22）

### 方式 A：前后端分离（完整体验）

```bash
# 1. 启动后端
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm start                   # 监听 http://localhost:3001

# 2. 另开一个终端，配置前端指向后端
cd frontend
npm install
echo "VITE_API_BASE=http://localhost:3001" > .env   # Windows: 用编辑器建 .env 文件
npm run dev                 # 打开终端提示的地址
```

### 方式 B：纯前端离线（双击即开）

直接用浏览器打开 `frontend/单文件预览版.html`，所有脚本、样式、图片已内联，不联网、不起服务也能完整体验（此版本恒为 localStorage 模式）。

或在 `frontend/` 下 `npm install && npm run build`，然后打开 `dist/index.html`。

## 两种运行模式

| 模式 | 触发条件 | 数据存储 | 适用场景 |
| --- | --- | --- | --- |
| **前后端分离** | `frontend/.env` 中设置了 `VITE_API_BASE` | SQLite（服务端） | 完整演示、答辩、展示接口设计 |
| **纯前端离线** | 未设置 `VITE_API_BASE`，或打开单文件版 | 浏览器 localStorage | 快速体验、发队友、无环境依赖 |

> 两种模式的数据互相独立，不会串档。演示前若切换模式，进度不互通属正常现象。

## API 一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/config` | 卡牌 / 图鉴 / 对话配置 |
| GET | `/api/state?userId=` | 当前用户完整状态 |
| POST | `/api/draw?userId=` | 抽当日卡（一天一次） |
| POST | `/api/claim?userId=` | 领取伙伴（服务端裁决稀有度） |
| POST | `/api/ritual/step?userId=` | 打卡某一步，body `{"index":0\|1\|2}` |
| POST | `/api/reset?userId=` | 重置演示数据 |

`userId` 为可选匿名标识（默认 `demo`），便于多人同时演示互不干扰。详见 [`backend/README.md`](backend/README.md)。

## 项目结构

```
beauty-ritual-cloudie/
├── README.md                       # 本文件
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js（可选）
│   ├── .env.example                # VITE_API_BASE 示例
│   ├── src/
│   │   ├── main.jsx                # 全部页面与业务逻辑
│   │   ├── style.css               # 全部样式
│   │   └── api.js                  # API 适配层（双模式切换核心）
│   ├── public/assets/cloudie.png   # 原始 Cloudie 形象图
│   ├── 单文件预览版.html            # 离线双击即开（如仓库包含）
│   └── dist/                       # 构建产物（gitignore）
├── backend/
│   ├── server.js                   # 服务入口
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── db.js                   # SQLite 建库与连接
│   │   ├── data.js                 # 卡牌 / 图鉴静态数据
│   │   └── routes/api.js           # 全部 REST 接口
│   ├── data/                       # 运行时生成的数据库（gitignore）
│   └── README.md                   # 后端说明
└── docs/
    ├── MISSION DOCUMENT ...pdf     # 赛事命题文档
    └── 赛事要求截图/                # 赛事页面截图
```

## 赛事信息

- **赛事**：L'Oréal Brandstorm 2027
- **作品**：Beauty Ritual — Cloudie Edition
- **定位**：以游戏化日常仪式，重新定义年轻人的美妆自我表达
- 命题文档与赛事要求截图见 [`docs/`](docs/)。

## 许可证

[MIT](LICENSE) © 2026 Beauty Ritual Team
