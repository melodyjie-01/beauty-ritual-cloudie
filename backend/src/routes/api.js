import { Router } from 'express';
import { db, ensureUser, today, previousDay } from '../db.js';
import { cards, ghosts, followups, RARE_RATE, ghostLabel } from '../data.js';

export const api = Router();

// 演示用单用户。前端通过 ?userId= 传入，默认 demo。
const uid = (req) => (req.query.userId || req.body?.userId || 'demo').toString().slice(0, 64);

function stateOf(userId) {
  ensureUser(userId);
  const date = today();
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
  const draw = db.prepare('SELECT * FROM draws WHERE user_id=? AND date=?').get(userId, date);

  const owned = db.prepare('SELECT ghost_id FROM collection WHERE user_id=?').all(userId).map((r) => r.ghost_id);
  if (!owned.includes('Cloudie')) owned.unshift('Cloudie');

  const log = {};
  for (const r of db.prepare('SELECT date, steps_json FROM ritual_log WHERE user_id=?').all(userId)) {
    const s = JSON.parse(r.steps_json);
    if (s.every(Boolean)) log[r.date] = true;
  }

  const seen = db.prepare('SELECT card_index FROM seen_cards WHERE user_id=? ORDER BY card_index').all(userId).map((r) => r.card_index);

  // 若昨天下过卡但今天没下，streak 归零（与前端逻辑一致）
  let streak = user.streak || 0;
  if (user.last_draw_date && user.last_draw_date !== date && user.last_draw_date !== previousDay(date)) {
    streak = 0;
  }

  const card = draw ? draw.card_index : null;
  return {
    userId,
    date,
    drawn: !!draw,
    card,
    claimed: draw ? !!draw.claimed : false,
    repeat: draw ? !!draw.repeat_card : false,
    step: draw ? JSON.parse(db.prepare('SELECT steps_json FROM ritual_log WHERE user_id=? AND date=?').get(userId, date)?.steps_json || '[false,false,false]') : [false, false, false],
    streak: draw ? streak : (user.last_draw_date === previousDay(date) ? streak : 0),
    owned,
    log,
    seen,
    activeCard: card === null ? null : cards[card],
    ghostLabel: draw?.ghost_id ? ghostLabel(draw.ghost_id) : null,
    progress: { owned: owned.length, total: ghosts.length }
  };
}

function config() {
  return { cards, ghosts, followups, rareRate: RARE_RATE };
}

// 健康检查
api.get('/health', (_req, res) => res.json({ ok: true, service: 'beauty-ritual-backend', time: new Date().toISOString() }));

// 静态配置（卡牌 / 图鉴 / 对话），前端改造后从这里拉取
api.get('/config', (_req, res) => res.json(config()));

// 全量状态
api.get('/state', (req, res) => res.json(stateOf(uid(req))));

// 抽卡：服务端保证一天一次，随机由服务端裁决
api.post('/draw', (req, res) => {
  const userId = uid(req);
  ensureUser(userId);
  const date = today();
  const existing = db.prepare('SELECT * FROM draws WHERE user_id=? AND date=?').get(userId, date);
  if (existing) return res.json({ ok: true, already: true, state: stateOf(userId) });

  const idx = Math.floor(Math.random() * cards.length);
  const seenBefore = db.prepare('SELECT 1 FROM seen_cards WHERE user_id=? AND card_index=?').get(userId, idx);
  const repeat = !!seenBefore;

  const user = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
  const nextStreak = user.last_draw_date === previousDay(date) ? (user.streak || 0) + 1 : 1;

  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO draws (user_id, date, card_index, repeat_card) VALUES (?,?,?,?)`)
      .run(userId, date, idx, repeat ? 1 : 0);
    db.prepare('INSERT OR IGNORE INTO seen_cards (user_id, card_index) VALUES (?,?)').run(userId, idx);
    db.prepare(`INSERT INTO ritual_log (user_id, date, steps_json) VALUES (?,?, '[false,false,false]')
                ON CONFLICT(user_id,date) DO NOTHING`).run(userId, date);
    db.prepare('UPDATE users SET streak=?, last_draw_date=? WHERE id=?').run(nextStreak, date, userId);
  });
  tx();

  res.json({ ok: true, already: false, state: stateOf(userId) });
});

// 领取伙伴：稀有度由服务端按概率裁决，服务端写入图鉴
api.post('/claim', (req, res) => {
  const userId = uid(req);
  const date = today();
  const draw = db.prepare('SELECT * FROM draws WHERE user_id=? AND date=?').get(userId, date);
  if (!draw) return res.status(400).json({ error: '请先抽卡 / draw a card first' });
  if (draw.claimed) return res.json({ ok: true, already: true, ghostId: draw.ghost_id, state: stateOf(userId) });

  const active = cards[draw.card_index];
  const isRare = Math.random() < RARE_RATE && !!active.hidden;
  const ghostId = isRare ? active.hidden : active.ghost;
  const fresh = !db.prepare('SELECT 1 FROM collection WHERE user_id=? AND ghost_id=?').get(userId, ghostId);

  const tx = db.transaction(() => {
    db.prepare('UPDATE draws SET claimed=1, ghost_id=?, is_rare=? WHERE user_id=? AND date=?')
      .run(ghostId, isRare ? 1 : 0, userId, date);
    db.prepare('INSERT OR IGNORE INTO collection (user_id, ghost_id) VALUES (?,?)').run(userId, ghostId);
  });
  tx();

  res.json({ ok: true, already: false, ghostId, ghostLabel: ghostLabel(ghostId), fresh, isRare, state: stateOf(userId) });
});

// 打卡：切换某一步（0/1/2）
api.post('/ritual/step', (req, res) => {
  const userId = uid(req);
  const date = today();
  const stepIndex = Number(req.body?.index);
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex > 2) {
    return res.status(400).json({ error: 'index 必须是 0/1/2' });
  }
  ensureUser(userId);
  const row = db.prepare('SELECT steps_json FROM ritual_log WHERE user_id=? AND date=?').get(userId, date);
  const steps = row ? JSON.parse(row.steps_json) : [false, false, false];
  steps[stepIndex] = !steps[stepIndex];
  db.prepare(`INSERT INTO ritual_log (user_id, date, steps_json) VALUES (?,?,?)
              ON CONFLICT(user_id,date) DO UPDATE SET steps_json=excluded.steps_json`)
    .run(userId, date, JSON.stringify(steps));
  res.json({ ok: true, state: stateOf(userId) });
});

// 重置演示数据
api.post('/reset', (req, res) => {
  const userId = uid(req);
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM draws WHERE user_id=?').run(userId);
    db.prepare('DELETE FROM collection WHERE user_id=?').run(userId);
    db.prepare('DELETE FROM ritual_log WHERE user_id=?').run(userId);
    db.prepare('DELETE FROM seen_cards WHERE user_id=?').run(userId);
    db.prepare('UPDATE users SET streak=0, last_draw_date=NULL WHERE id=?').run(userId);
  });
  tx();
  res.json({ ok: true, state: stateOf(userId) });
});
