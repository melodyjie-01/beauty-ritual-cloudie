// 卡牌 / 图鉴数据 —— 与前端 src/main.jsx 中的 cards / ghosts / followups 保持一致。
// 前端改造后这些静态数据由后端提供，单点维护，避免前后端口径漂移。

export const cards = [
  {
    name: 'THE SUN', mood: 'Bright & hopeful', line: 'Let your light take up space today.',
    color: 'sun', ghost: 'Sunny', ghostName: 'Sunny, the Sunshine Plush', hidden: 'Amber',
    message: 'I pulled The Sun for you! It is a little reminder that warmth and joy can begin with one small thing. Shall we make today feel brighter?',
    ritual: 'A little brightness',
    stretch: 'Open your arms wide and take five slow, easy breaths.',
    skin: 'Keep it fresh: gentle cleanse, light hydration and SPF for daytime.',
    scent: 'Try citrus, neroli or soft orange blossom notes.'
  },
  {
    name: 'THE MOON', mood: 'Soft & reflective', line: 'You do not need every answer tonight.',
    color: 'moon', ghost: 'Chrome', ghostName: 'Chrome, the Metal Edition', hidden: 'Milk Cow',
    message: 'The Moon is here. It invites you to slow down and listen inward. No need to solve everything right now. Let’s make a softer space for you.',
    ritual: 'The soft reset',
    stretch: 'Roll your shoulders gently, then stretch your neck from side to side.',
    skin: 'Choose a gentle cleanse and a comforting moisturiser. Keep your routine simple.',
    scent: 'Explore lavender, white tea or a soft musk.'
  },
  {
    name: 'THE STAR', mood: 'Restored & inspired', line: 'A small hope is still a powerful beginning.',
    color: 'star', ghost: 'Amber', ghostName: 'Amber, the Glass Edition', hidden: 'Leatherette',
    message: 'The Star! A tiny sign to refill your own cup. Pick one caring thing and let it be enough for today.',
    ritual: 'A moment to refill',
    stretch: 'Reach both hands overhead, then fold forward comfortably.',
    skin: 'Add a hydrating step that already works well for your skin.',
    scent: 'Try airy, clean notes such as cotton, iris or white musk.'
  },
  {
    name: 'TEMPERANCE', mood: 'Balanced & calm', line: 'Find your own gentle rhythm.',
    color: 'temperance', ghost: 'Rainy', ghostName: 'Rainy, the Rain Cloud', hidden: 'Mochi Cat',
    message: 'Temperance says: balance, not perfection. Let’s create a ritual that fits your real day, not an imaginary perfect one.',
    ritual: 'Back to balance',
    stretch: 'Try a slow seated twist on each side, without forcing the movement.',
    skin: 'Keep familiar basics: cleanse, moisturise and daytime sun protection.',
    scent: 'Explore tea, soft woods or gentle herbal notes.'
  }
];

export const followups = [
  'Because warmth suits you. Start with one small thing you can finish in two minutes — the rest of the day gets easier from there.',
  'It is fine to go quiet for a while. Nothing needs to be decided before tonight. Just soften the space around you.',
  'Hope counts even when it is small. Pick one kind thing, do it slowly, and let that be the whole win.',
  'Balance beats intensity. If today is full, a shorter ritual that you actually finish is the better ritual.'
];

export const ghosts = [
  { name: 'Cloudie', kind: 'Original Plush', rarity: 'Common', desc: 'Your soft, star-holding companion.', unlock: true },
  { name: 'Sunny', kind: 'Sunshine Plush', rarity: 'Common', desc: 'A little burst of golden energy.', unlock: false },
  { name: 'Rainy', kind: 'Rain Cloud', rarity: 'Rare', desc: 'A cosy friend for rainy-day resets.', unlock: false },
  { name: 'Mochi Cat', kind: 'Cat Edition', rarity: 'Special', desc: 'A surprise little cat-day visitor.', unlock: false },
  { name: 'Milk Cow', kind: 'Milk Edition', rarity: 'Secret', desc: 'A hidden black-and-cream collectible.', unlock: false },
  { name: 'Chrome', kind: 'Metal Edition', rarity: 'Rare', desc: 'A polished, moonlit material study.', unlock: false },
  { name: 'Amber', kind: 'Glass Edition', rarity: 'Special', desc: 'Warm translucent glow, like a tiny keepsake.', unlock: false },
  { name: 'Leatherette', kind: 'Leather Edition', rarity: 'Secret', desc: 'A tactile collector edition.', unlock: false }
];

export const RARE_RATE = 0.12; // 与前端 Math.random() < .12 一致，现由服务端裁决

export function ghostLabel(name) {
  const g = ghosts.find((x) => x.name === name);
  return g ? `${g.name} · ${g.kind}` : 'Cloudie';
}
