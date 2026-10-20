import type { CardDef, CardInst, Effect, SpiritDef } from '../game/types';

/**
 * Every card. A spirit card sets a creature down on a tile; a charm is a one-shot spell. `spirit`/`fx` get `up` (the upgraded copy) so each
 * card spells out what an upgrade changes. Numbers live here once: the card face, the detail text and the engine all read them.
 */
const spirit = (
  id: string,
  keeper: CardDef['keeper'],
  rarity: CardDef['rarity'],
  cost: number,
  make: (up: boolean) => SpiritDef,
  extra: Partial<CardDef> = {},
): CardDef => ({ id, kind: 'spirit', keeper, rarity, cost, spirit: make, ...extra });

const charm = (
  id: string,
  keeper: CardDef['keeper'],
  rarity: CardDef['rarity'],
  cost: number,
  aim: NonNullable<CardDef['aim']>,
  fx: (up: boolean) => Effect[],
  extra: Partial<CardDef> = {},
): CardDef => ({ id, kind: 'charm', keeper, rarity, cost, aim, fx, art: id, ...extra });

/** A decoy of leaves: the Tanuki's starter and what the Parade makes. */
export const LEAF_DECOY = (up: boolean): SpiritDef => ({
  art: 'leafDecoy',
  hp: up ? 14 : 10,
  lifespan: up ? 14 : 12,
  onDeath: [{ k: 'burst', dmg: up ? 4 : 3, radius: 1.25 }],
});

/** A paper warrior for the keeper's ability and the like: it fights a while, then comes apart. */
export const PAPER_WARRIOR = (up: boolean, lifespan = 12): SpiritDef => ({
  art: 'paperWarrior',
  hp: up ? 12 : 9,
  atk: { kind: 'melee', dmg: up ? 6 : 4, every: 1.1, range: 0.95 },
  roam: { every: 5 },
  lifespan,
});

const PAPER_BIRD = (up: boolean): SpiritDef => ({
  art: 'paperBird',
  hp: 3,
  atk: { kind: 'shot', dmg: up ? 3 : 2, every: 0.9, range: 5 },
  roam: { every: 3 },
  lifespan: 14,
});

const list: CardDef[] = [
  // ——— neutral spirits ———
  spirit('kodama', 'any', 'common', 1, (u) => ({ art: 'kodama', hp: 5, oil: { n: 1, every: u ? 6.5 : 8 } })),
  spirit('jizo', 'any', 'common', 2, (u) => ({ art: 'jizo', hp: u ? 34 : 25, thorns: u ? 2 : 1 })),
  spirit('crane', 'any', 'common', 2, (u) => ({ art: 'crane', hp: 4, atk: { kind: 'shot', dmg: u ? 4 : 3, every: 1.1, range: 6 } })),
  spirit('mochi', 'any', 'common', 1, (u) => ({ art: 'mochi', hp: u ? 22 : 15, sticky: [0.6, 2] })),
  spirit('snowHare', 'any', 'common', 2, (u) => ({
    art: 'snowHare',
    hp: 4,
    atk: { kind: 'shot', dmg: 2, every: 1.2, range: 5, slow: [u ? 0.55 : 0.4, 2.4] },
  })),
  spirit('wisp', 'any', 'common', 2, (u) => ({
    art: 'wisp',
    hp: 3,
    atk: { kind: 'shot', dmg: 1, every: 1.4, range: 5, burn: [u ? 3.5 : 2.5, 3] },
  })),
  spirit('toro', 'any', 'rare', 2, (u) => ({ art: 'toro', hp: 9, aura: { to: 'adjacent', rate: u ? 0.45 : 0.3 } })),
  spirit('bambooCannon', 'any', 'rare', 3, (u) => ({
    art: 'bambooCannon',
    hp: 5,
    atk: { kind: 'lob', dmg: u ? 8 : 5, every: 2, range: 7, splash: 0.9 },
  })),
  spirit('daruma', 'any', 'rare', 2, (u) => ({ art: 'daruma', hp: u ? 20 : 16, revive: u ? 0.9 : 0.6 })),
  spirit('bell', 'any', 'rare', 3, (u) => ({
    art: 'bell',
    hp: 14,
    atk: { kind: 'pulse', dmg: u ? 8 : 6, every: 4.5, range: 5, stun: 0.8 },
  })),
  spirit('kamaitachi', 'any', 'rare', 2, (u) => ({ art: 'kamaitachi', hp: 4, atk: { kind: 'pierce', dmg: u ? 3 : 2, every: 1.3, range: 5 } })),

  // ——— neutral charms ———
  charm('ofuda', 'any', 'common', 1, 'lane', (u) => [{ k: 'stun', secs: u ? 3.5 : 2.5, scope: 'lane' }]),
  charm('sake', 'any', 'common', 1, 'none', (u) => [{ k: 'mend', hp: u ? 9 : 6, scope: 'all' }]),
  charm('gust', 'any', 'common', 2, 'lane', (u) => [{ k: 'push', rows: u ? 3 : 2, scope: 'lane' }]),
  charm('fireFan', 'any', 'common', 2, 'lane', (u) => [{ k: 'hit', dmg: u ? 7 : 5, scope: 'lane', burn: [2, 3] }]),
  charm('maneki', 'any', 'rare', 1, 'none', (u) => [{ k: 'redeal' }, { k: 'oil', n: u ? 2 : 1 }], { upCost: 0 }),
  charm('oilJar', 'any', 'common', 1, 'none', (u) => [{ k: 'oil', n: u ? 4 : 3 }], { vanish: true }),
  charm('riceBall', 'any', 'rare', 1, 'none', (u) => [{ k: 'flame', n: u ? 2 : 1 }], { vanish: true }),
  charm(
    'amaterasu',
    'any',
    'legend',
    5,
    'none',
    (u) => [
      { k: 'hit', dmg: u ? 12 : 8, scope: 'all', stun: u ? 3 : 2 },
      { k: 'mend', hp: u ? 12 : 8, scope: 'all' },
      { k: 'flame', n: u ? 2 : 1 },
    ],
    { vanish: true },
  ),
  charm('talismanStorm', 'any', 'epic', 3, 'none', (u) => [{ k: 'hit', dmg: u ? 5 : 3, scope: 'all', stun: 0.5 }]),

  // ——— Miko Hanae: purification ———
  spirit('ofudaArcher', 'miko', 'common', 2, (u) => ({ art: 'ofudaArcher', hp: 5, atk: { kind: 'shot', dmg: u ? 4 : 3, every: 1.2, range: 5 } }), {
    starter: true,
  }),
  spirit(
    'komainu',
    'miko',
    'common',
    2,
    (u) => ({ art: 'komainu', hp: u ? 16 : 12, atk: { kind: 'melee', dmg: u ? 6 : 4, every: 1, range: 0.95 } }),
    { starter: true },
  ),
  charm('sacredRope', 'miko', 'rare', 1, 'lane', (u) => [{ k: 'zone', slow: 0.5, secs: u ? 13 : 9 }]),
  charm('salt', 'miko', 'common', 1, 'lane', (u) => [{ k: 'hit', dmg: u ? 9 : 6, scope: 'front' }]),
  spirit('kagura', 'miko', 'rare', 3, (u) => ({ art: 'kagura', hp: 7, aura: { to: 'lane', dmg: u ? 0.6 : 0.4, rate: 0.1 } })),
  charm('omamori', 'miko', 'common', 2, 'none', (u) => [{ k: 'bless', atk: u ? 0.4 : 0.3, secs: u ? 12 : 10, scope: 'all' }]),
  spirit('torii', 'miko', 'rare', 3, (u) => ({ art: 'torii', hp: 18, atk: { kind: 'pulse', dmg: u ? 3 : 2, every: 0.7, range: 1.4 } })),
  charm('shide', 'miko', 'common', 2, 'lane', (u) => [{ k: 'hit', dmg: u ? 4 : 3, scope: 'lanes3' }]),
  spirit('kuzunoha', 'miko', 'epic', 4, (u) => ({ art: 'kuzunoha', hp: 7, atk: { kind: 'pierce', dmg: u ? 8 : 6, every: 1.1, range: 7 } })),
  spirit('inari', 'miko', 'legend', 5, (u) => ({ art: 'inari', hp: u ? 30 : 24, aura: { to: 'all', rate: u ? 0.45 : 0.3, dmg: u ? 0.35 : 0.25 } })),
  charm('exorcism', 'miko', 'epic', 4, 'none', (u) => [{ k: 'hit', dmg: u ? 22 : 15, scope: 'strongest' }]),

  // ——— Ronin Ichi: steel and patience ———
  spirit(
    'wanderer',
    'ronin',
    'common',
    2,
    (u) => ({ art: 'wanderer', hp: u ? 18 : 14, atk: { kind: 'melee', dmg: u ? 7 : 5, every: 1.2, range: 0.95 } }),
    { starter: true },
  ),
  spirit('bambooWall', 'ronin', 'common', 1, (u) => ({ art: 'bambooWall', hp: u ? 22 : 16, thorns: u ? 2 : 1 }), { starter: true }),
  spirit('kyudo', 'ronin', 'rare', 3, (u) => ({ art: 'kyudo', hp: 8, atk: { kind: 'shot', dmg: u ? 10 : 7, every: 2.2, range: 7 } })),
  spirit('iaido', 'ronin', 'rare', 3, (u) => ({ art: 'iaido', hp: 10, atk: { kind: 'melee', dmg: u ? 20 : 13, every: 3, range: 0.95 } })),
  spirit('swordRack', 'ronin', 'common', 2, (u) => ({ art: 'swordRack', hp: 10, aura: { to: 'adjacent', dmg: u ? 0.5 : 0.35 } })),
  charm('kunai', 'ronin', 'common', 1, 'lane', (u) => [{ k: 'hit', dmg: u ? 6 : 4, scope: 'front' }]),
  spirit('kabuto', 'ronin', 'rare', 3, (u) => ({ art: 'kabuto', hp: u ? 46 : 34, thorns: u ? 3 : 2 })),
  charm('riposte', 'ronin', 'common', 2, 'none', (u) => [{ k: 'hit', dmg: u ? 7 : 5, scope: 'fronts' }]),
  spirit('oniMask', 'ronin', 'epic', 4, (u) => ({
    art: 'oniMask',
    hp: u ? 32 : 26,
    atk: { kind: 'melee', dmg: u ? 11 : 8, every: 1.4, range: 0.95, cleave: true },
  })),
  charm('lastStand', 'ronin', 'rare', 3, 'none', (u) => [
    { k: 'bless', atk: u ? 0.7 : 0.5, secs: 8, scope: 'all' },
    { k: 'mend', hp: u ? 10 : 6, scope: 'all' },
  ]),
  spirit('swordSaint', 'ronin', 'legend', 5, (u) => ({
    art: 'swordSaint',
    hp: u ? 36 : 28,
    atk: { kind: 'melee', dmg: u ? 16 : 12, every: 0.9, range: 0.95, cleave: true },
  })),
  spirit('brawler', 'ronin', 'common', 2, (u) => ({ art: 'brawler', hp: 10, atk: { kind: 'melee', dmg: u ? 4 : 3, every: 0.7, range: 0.95 } })),

  // ——— Tanuki Bunbuku: tricks and trade ———
  spirit('leafDecoy', 'tanuki', 'common', 1, LEAF_DECOY, { starter: true }),
  spirit('acorn', 'tanuki', 'common', 2, (u) => ({ art: 'acorn', hp: 5, atk: { kind: 'shot', dmg: u ? 3.5 : 2.5, every: 1, range: 6 } }), {
    starter: true,
  }),
  spirit('teapot', 'tanuki', 'common', 2, (u) => ({
    art: 'teapot',
    hp: 6,
    atk: { kind: 'lob', dmg: u ? 4 : 3, every: 2.4, range: 6, splash: 0.65, burn: [u ? 2.5 : 1.5, 3] },
  })),
  charm('pouch', 'tanuki', 'common', 1, 'none', (u) => [{ k: 'bounty', per: 1, max: u ? 6 : 4 }], { vanish: true }),
  charm('henge', 'tanuki', 'rare', 2, 'tile', () => [{ k: 'copyLast' }], { upCost: 1 }),
  spirit('bellyDrum', 'tanuki', 'rare', 3, (u) => ({
    art: 'bellyDrum',
    hp: 14,
    atk: { kind: 'pulse', dmg: 1, every: u ? 3.2 : 4, range: 2.4, stun: 1.2 },
  })),
  spirit('sakeStall', 'tanuki', 'common', 2, (u) => ({ art: 'sakeStall', hp: 11, heal: { hp: u ? 2 : 1, every: 1, to: 'adjacent' } })),
  charm('parade', 'tanuki', 'rare', 3, 'none', (u) => [{ k: 'summon', spirit: LEAF_DECOY(false), n: u ? 4 : 3, at: 'random' }]),
  charm('dice', 'tanuki', 'common', 1, 'none', (u) => [{ k: 'gamble', win: u ? 7 : 5, lose: 0 }], { vanish: true }),
  spirit('takarabune', 'tanuki', 'legend', 5, (u) => ({ art: 'takarabune', hp: u ? 24 : 18, oil: { n: u ? 4 : 3, every: u ? 2.6 : 3.2 } })),
  spirit('kettle', 'tanuki', 'epic', 4, (u) => ({ art: 'kettle', hp: 20, oil: { n: 2, every: u ? 3 : 3.8 } })),

  // ——— Seimei the onmyōji: paper servants that go where the parade is thickest ———
  spirit(
    'shikigami',
    'onmyoji',
    'common',
    2,
    (u) => ({ art: 'shikigami', hp: 4, atk: { kind: 'shot', dmg: u ? 3.2 : 2.2, every: 1.1, range: 5 }, roam: { every: u ? 5 : 6 } }),
    { starter: true },
  ),
  spirit('paperWarrior', 'onmyoji', 'common', 2, (u) => ({ ...PAPER_WARRIOR(u, undefined), lifespan: undefined, roam: { every: u ? 6 : 7 } }), {
    starter: true,
  }),
  spirit('hitogata', 'onmyoji', 'common', 1, (u) => ({ art: 'hitogata', hp: u ? 13 : 9, onDeath: [{ k: 'mend', hp: u ? 5 : 3, scope: 'all' }] })),
  charm('goma', 'onmyoji', 'common', 2, 'lane', (u) => [{ k: 'hit', dmg: u ? 6 : 4, scope: 'lane', burn: [2, 3] }]),
  spirit('inkRaven', 'onmyoji', 'rare', 3, (u) => ({
    art: 'inkRaven',
    hp: 5,
    atk: { kind: 'pierce', dmg: u ? 4 : 3, every: 1.4, range: 6 },
    roam: { every: 5 },
  })),
  charm('kekkai', 'onmyoji', 'rare', 2, 'lane', (u) => [
    { k: 'zone', slow: 0.6, secs: u ? 12 : 8 },
    { k: 'stun', secs: 1, scope: 'lane' },
  ]),
  spirit('kudagitsune', 'onmyoji', 'rare', 2, (u) => ({
    art: 'kudagitsune',
    hp: 3,
    atk: { kind: 'shot', dmg: u ? 1.6 : 1.2, every: 0.5, range: 5 },
    roam: { every: 7 },
  })),
  spirit('gogyo', 'onmyoji', 'rare', 3, (u) => ({ art: 'gogyo', hp: 10, aura: { to: 'all', rate: u ? 0.25 : 0.15, dmg: u ? 0.15 : 0.1 } })),
  charm('shikiSwarm', 'onmyoji', 'rare', 3, 'none', (u) => [{ k: 'summon', spirit: PAPER_BIRD(u), n: u ? 4 : 3, at: 'random' }]),
  charm('pentagram', 'onmyoji', 'epic', 3, 'none', (u) => [{ k: 'hit', dmg: u ? 8 : 5, scope: 'all', slow: [0.4, 4] }]),
  spirit('seimei', 'onmyoji', 'legend', 5, (u) => ({
    art: 'seimei',
    hp: u ? 22 : 16,
    atk: { kind: 'pierce', dmg: u ? 8 : 6, every: 1.2, range: 7 },
    aura: { to: 'all', dmg: u ? 0.3 : 0.2 },
  })),
];

export const CARDS: Record<string, CardDef> = Object.fromEntries(list.map((c) => [c.id, c]));
export const CARD_IDS: string[] = list.map((c) => c.id);

export const card = (id: string): CardDef => {
  const def = CARDS[id];
  if (!def) throw new Error(`unknown card ${id}`);
  return def;
};

export const costOf = (c: CardInst): number => {
  const def = card(c.id);
  return c.up && def.upCost !== undefined ? def.upCost : def.cost;
};

/** The spirit a card sets down, in the copy's own form. */
export const spiritOf = (c: CardInst): SpiritDef | null => card(c.id).spirit?.(c.up) ?? null;
export const fxOf = (c: CardInst): Effect[] => card(c.id).fx?.(c.up) ?? [];
