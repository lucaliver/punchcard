import { t } from '../../core/i18n';
import { CONFIG } from '../../data/config';
import { card, costOf, fxOf, spiritOf } from '../../data/cards';
import type { CardInst, Effect, FoeAbility, FoeDef, SpiritDef } from '../../game/types';

/** What a card says, read from its data: the numbers on its face, and the sentences of its detail view. */

export interface Chip {
  /** Id of a drawing (`ui/art`). */
  icon: string;
  text: string;
}

/** A number as people write it: whole, or with one decimal. */
export const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, ''));
const pct = (n: number): string => `${Math.round(n * 100)}%`;

/** Highlights `**word**` in a rules line. */
export const rich = (s: string): string => s.replace(/\*\*(.+?)\*\*/g, '<span class="kw">$1</span>');

function spiritChips(sd: SpiritDef): Chip[] {
  const out: Chip[] = [{ icon: 'heart', text: fmt(sd.hp) }];
  const atk = sd.atk;
  if (atk) {
    out.push({ icon: 'sword', text: fmt(atk.dmg) });
    out.push({ icon: 'clock', text: fmt(atk.every) });
  }
  if (sd.oil) out.push({ icon: 'oil', text: `${fmt(sd.oil.n)}/${fmt(sd.oil.every)}s` });
  if (sd.heal) out.push({ icon: 'heart', text: `+${fmt(sd.heal.hp)}/${fmt(sd.heal.every)}s` });
  if (sd.aura) out.push({ icon: 'star', text: `+${pct(sd.aura.rate ?? sd.aura.dmg ?? 0)}` });
  if (sd.thorns) out.push({ icon: 'thorns', text: fmt(sd.thorns) });
  if (sd.lifespan) out.push({ icon: 'clock', text: `${fmt(sd.lifespan)}s` });
  return out;
}

function effectChip(fx: Effect): Chip | null {
  switch (fx.k) {
    case 'hit':
      return { icon: 'sword', text: fmt(fx.dmg) };
    case 'stun':
      return { icon: 'stun', text: `${fmt(fx.secs)}s` };
    case 'push':
      return { icon: 'gust', text: fmt(fx.rows) };
    case 'burst':
      return { icon: 'burn', text: fmt(fx.dmg) };
    case 'oil':
      return { icon: 'oil', text: `+${fmt(fx.n)}` };
    case 'bounty':
      return { icon: 'oil', text: `0-${fmt(fx.max)}` };
    case 'redeal':
      return { icon: 'cards', text: '' };
    case 'mend':
      return { icon: 'heart', text: `+${fmt(fx.hp)}` };
    case 'flame':
      return { icon: 'flame', text: `+${fmt(fx.n)}` };
    case 'bless':
      return { icon: 'star', text: `+${pct(fx.atk)}` };
    case 'zone':
      return { icon: 'slow', text: `${fmt(fx.secs)}s` };
    case 'summon':
      return { icon: 'leafDecoy', text: `×${fx.n}` };
    case 'copyLast':
      return { icon: 'henge', text: '' };
    case 'gamble':
      return { icon: 'dice', text: `${fmt(fx.win)}/${fmt(fx.lose)}` };
  }
}

/** The few numbers on the face of a card (`max` chips). */
export function cardChips(c: CardInst, max = 3): Chip[] {
  const def = card(c.id);
  if (def.kind === 'spirit') return spiritChips(spiritOf(c) as SpiritDef).slice(0, max);
  return fxOf(c)
    .map(effectChip)
    .filter((x): x is Chip => x !== null && x.text !== '')
    .slice(0, max);
}

/** One sentence for an effect. */
export function effectLine(fx: Effect): string {
  switch (fx.k) {
    case 'hit': {
      const parts = [t('fx.hit', { dmg: fmt(fx.dmg), scope: t(`scope.${fx.scope}`) })];
      if (fx.stun) parts.push(t('fx.andStun', { secs: fmt(fx.stun) }));
      if (fx.slow) parts.push(t('fx.andSlow', { pct: pct(fx.slow[0]), secs: fmt(fx.slow[1]) }));
      if (fx.burn) parts.push(t('fx.andBurn', { dps: fmt(fx.burn[0]), secs: fmt(fx.burn[1]) }));
      return parts.join(' ');
    }
    case 'stun':
      return t('fx.stun', { secs: fmt(fx.secs), scope: t(`scope.${fx.scope}`) });
    case 'push':
      return t('fx.push', { rows: fmt(fx.rows), scope: t(`scope.${fx.scope}`) });
    case 'burst':
      return t('fx.burst', { dmg: fmt(fx.dmg) });
    case 'oil':
      return t('fx.oil', { n: fmt(fx.n) });
    case 'bounty':
      return t('fx.bounty', { per: fmt(fx.per), max: fmt(fx.max) });
    case 'redeal':
      return t('fx.redeal');
    case 'mend':
      return t(fx.scope === 'all' ? 'fx.mendAll' : 'fx.mendLane', { hp: fmt(fx.hp) });
    case 'flame':
      return t('fx.flame', { n: fmt(fx.n) });
    case 'bless':
      return t('fx.bless', { pct: pct(fx.atk), secs: fmt(fx.secs) });
    case 'zone':
      return t('fx.zone', { pct: pct(fx.slow), secs: fmt(fx.secs) });
    case 'summon':
      return t('fx.summon', { n: fx.n });
    case 'copyLast':
      return t('fx.copyLast');
    case 'gamble':
      return fx.lose > 0 ? t('fx.gamble', { win: fmt(fx.win), lose: fmt(fx.lose) }) : t('fx.gambleSafe', { win: fmt(fx.win) });
  }
}

/** The sentences that say what a spirit does. */
export function spiritLines(sd: SpiritDef): string[] {
  const lines = [t('stat.hp', { n: fmt(sd.hp) })];
  const a = sd.atk;
  if (a) {
    const extra: string[] = [];
    if (a.stun) extra.push(t('fx.andStun', { secs: fmt(a.stun) }));
    if (a.slow) extra.push(t('fx.andSlow', { pct: pct(a.slow[0]), secs: fmt(a.slow[1]) }));
    if (a.burn) extra.push(t('fx.andBurn', { dps: fmt(a.burn[0]), secs: fmt(a.burn[1]) }));
    const p = { dmg: fmt(a.dmg), every: fmt(a.every), range: fmt(a.range), splash: fmt(a.splash ?? 0) };
    lines.push([t(`stat.atk.${a.kind}${a.cleave ? 'Cleave' : ''}`, p), ...extra].join(' '));
  }
  if (sd.oil) lines.push(t('stat.oil', { n: fmt(sd.oil.n), every: fmt(sd.oil.every) }));
  if (sd.heal) lines.push(t(sd.heal.to === 'lane' ? 'stat.healLane' : 'stat.healAdj', { hp: fmt(sd.heal.hp), every: fmt(sd.heal.every) }));
  if (sd.aura) {
    const bits: string[] = [];
    if (sd.aura.rate) bits.push(t('stat.auraRate', { pct: pct(sd.aura.rate) }));
    if (sd.aura.dmg) bits.push(t('stat.auraDmg', { pct: pct(sd.aura.dmg) }));
    lines.push(t(`stat.aura.${sd.aura.to}`, { what: bits.join(` ${t('stat.and')} `) }));
  }
  if (sd.thorns) lines.push(t('stat.thorns', { n: fmt(sd.thorns) }));
  if (sd.sticky) lines.push(t('stat.sticky', { pct: pct(sd.sticky[0]), secs: fmt(sd.sticky[1]) }));
  if (sd.revive) lines.push(t('stat.revive', { pct: pct(sd.revive) }));
  if (sd.trap) lines.push(t('stat.trap', { dmg: fmt(sd.trap.dmg) }));
  if (sd.lifespan) lines.push(t('stat.lifespan', { secs: fmt(sd.lifespan) }));
  for (const fx of sd.onDeath ?? []) lines.push(t('stat.onDeath', { what: effectLine(fx) }));
  return lines;
}

/** The sentences of a card's detail view: rules first. */
export function cardLines(c: CardInst): string[] {
  const def = card(c.id);
  if (def.kind === 'spirit') {
    const lines = spiritLines(spiritOf(c) as SpiritDef);
    lines.push(t('rule.merge', { max: CONFIG.maxLevel }));
    return lines;
  }
  const lines = fxOf(c).map(effectLine);
  lines.push(t(`aim.${def.aim ?? 'none'}`));
  if (def.vanish) lines.push(t('rule.vanish'));
  return lines;
}

/** What a card costs, in the oil on its seal. */
export const costText = (c: CardInst): string => String(costOf(c));

function abilityLine(a: FoeAbility): string {
  switch (a.k) {
    case 'leap':
      return t('foe.leap');
    case 'web':
      return t('foe.web', { every: fmt(a.every), secs: fmt(a.secs) });
    case 'mend':
      return t('foe.mend', { hp: fmt(a.hp), every: fmt(a.every) });
    case 'hasten':
      return t('foe.hasten', { pct: pct(a.speed) });
    case 'swap':
      return t('foe.swap', { every: fmt(a.every) });
    case 'summon':
      return t('foe.summon', { n: a.n, foe: t(`foe.${a.foe}.name`), every: fmt(a.every) });
    case 'freeze':
      return t('foe.freeze', { every: fmt(a.every), secs: fmt(a.secs) });
    case 'split':
      return t('foe.split', { n: a.n, foe: t(`foe.${a.foe}.name`) });
    case 'rage':
      return t('foe.rage', { at: pct(a.at), mul: fmt(a.speed) });
    case 'slam':
      return t('foe.slam', { every: fmt(a.every), dmg: fmt(a.dmg) });
    case 'volley':
      return t('foe.volley', { every: fmt(a.every), dmg: fmt(a.dmg) });
  }
}

/** The sentences that say what a foe does (the almanac and the first-sight panel). */
export function foeLines(def: FoeDef, hpMul = 1): string[] {
  const lines = [t('foe.hp', { n: Math.round(def.hp * hpMul) }), t('foe.speed', { n: fmt(def.speed) })];
  if (def.dmg > 0 && !def.fly) lines.push(t(def.reach > 1.3 ? 'foe.ranged' : 'foe.melee', { dmg: fmt(def.dmg), every: fmt(def.every) }));
  if (def.fly) lines.push(t('foe.fly'));
  if (def.armor) lines.push(t('foe.armor', { n: def.armor }));
  lines.push(t('foe.leak', { n: def.leak }));
  for (const a of def.abilities ?? []) lines.push(abilityLine(a));
  return lines;
}
