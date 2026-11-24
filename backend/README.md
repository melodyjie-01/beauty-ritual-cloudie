# Beauty Ritual · 后端服务

Node.js + Express + SQLite 的 REST API。把原前端原型中由浏览器 `localStorage` 承担的抽卡、稀有度裁决、图鉴解锁、连续天数等逻辑搬到服务端，使「一天一次」「稀有概率」成为服务端权威规则，而不是可被客户端绕过的本地约束。

## 技术栈

- Node.js 18+（原生 ESM）
- Express 4（HTTP 路由）
- better-sqlite3（嵌入式 SQL 数据库，零外部服务）
- cors / dotenv

## 启动

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm start
```

服务默认监听 `http://localhost:3001`。首次启动会在 `backend/data/beauty-ritual.db` 自动建库建表（该文件已被 `.gitignore` 忽略，不会提交）。

开发热重载：`npm run dev`。

## API

所有接口都接受可选的 `?userId=`（演示用，默认 `demo`），便于多人同时测试互不干扰。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/config` | 卡牌 / 图鉴 / 对话等静态配置 |
| GET | `/api/state?userId=` | 当前用户完整状态 |
| POST | `/api/draw?userId=` | 抽当日卡，服务端保证一天一次 |
| POST | `/api/claim?userId=` | 领取伙伴，服务端按 12% 裁决稀有款并写入图鉴 |
| POST | `/api/ritual/step?userId=` | body `{"index":0\|1\|2}` 切换某一步打卡 |
| POST | `/api/reset?userId=` | 重置该用户演示数据 |

返回结构中的 `state` 与前端状态字段一一对应（`drawn` / `card` / `claimed` / `step` / `streak` / `owned` / `log` / `seen` / `repeat`），前端拿到后直接渲染。

## 数据模型

```
users(id, streak, last_draw_date)
draws(id, user_id, date, card_index, claimed, ghost_id, is_rare, repeat_card)   -- (user_id,date) 唯一
collection(user_id, ghost_id, first_obtained_at)                              -- 图鉴
ritual_log(user_id, date, steps_json)                                         -- 三步打卡
seen_cards(user_id, card_index)                                               -- 用于判重复卡
```

一次抽卡的 `(user_id, date)` 唯一约束，从数据库层面杜绝「一天多次抽卡」；稀有度与图鉴解锁由 `claim` 接口在服务端裁决，客户端无法伪造。

## 为什么要这个后端

原原型是纯前端演示（original README: "no account, backend or database"）。为参加比赛、完整展示前后端能力，本项目补齐了真实服务端：规则上链前先「上服务端」，让评审能看到数据持久化与接口设计，同时前端保留纯本地降级模式，两种模式可切换演示。
