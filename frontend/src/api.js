// 前端 API 适配层。
// 配置了 VITE_API_BASE（在 frontend/.env 中）时走真后端；否则回退到 localStorage 纯前端模式。
// 这样同一份源码既能演示「前后端分离」，也能离线双击单文件版独立运行。

export const API_BASE = (import.meta.env?.VITE_API_BASE || '').replace(/\/$/, '');
export const HAS_API = !!API_BASE;

const USER = 'demo';
const qs = (path) => `${API_BASE}${path}${path.includes('?') ? '&' : '?'}userId=${USER}`;

async function req(path, options = {}) {
  const res = await fetch(qs(path), {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const apiGetConfig = () => req('/api/config');
export const apiGetState = () => req('/api/state');
export const apiDraw = () => req('/api/draw', { method: 'POST' });
export const apiClaim = () => req('/api/claim', { method: 'POST' });
export const apiStep = (index) => req('/api/ritual/step', { method: 'POST', body: JSON.stringify({ index }) });
export const apiReset = () => req('/api/reset', { method: 'POST' });
