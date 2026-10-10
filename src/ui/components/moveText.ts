import { type TKey, t } from '../../core/i18n';
import { CONFIG, halfPct } from '../../data/config';
import { HEXES } from '../../data/hexes';
import { STATUSES, statusIcon } from '../../data/statuses';
import { sfx } from '../../audio/sfx';
import type { EnemyDef, MoveDef, Tone } from '../../game/types';
import { creature } from '../art/creatures';
import { icon, INTENT_ICON } from '../art/icons';
import { h, onPress } from '../dom';
import { keywordHtml, statusDesc, statusName, UNKNOWN } from './cardView';
import { openCardDetail, openInfo } from './modals';

/**
 * Colour-coded description of an enemy move (base values unless live `values` are given): damage in red,
 * Block in blue, statuses in their tone, curses in purple, theft in amber.
 * `verbose` adds words ("15 damage", "adds Hex") for the in-fight info sheet.
 */
export interface MoveValues {
  /** Damage per hit as it will land (floor scaling, Strength, Weak…). */
  dmg: (m: MoveDef) => number;
  /** Block and heal scale alike. */
  block: (m: MoveDef) => number;
  heal: (m: MoveDef) => number;
}

const baseValues: MoveValues = {
  dmg: (m) => Math.round((m.dmg ?? 0) * CONFIG.enemyDmg),
  block: (m) => Math.round((m.block ?? 0) * CONFIG.enemyDmg),
  heal: (m) => Math.round((m.heal ?? 0) * CONFIG.enemyDmg),
};

export function moveEffect(m: MoveDef, verbose = false, values: MoveValues = baseValues): string {
  const parts: string[] = [];
  if (m.dmg) {
    const n = values.dmg(m);
    const v = m.hits && m.hits > 1 ? `${n}×${m.hits}` : String(n);
    parts.push(`<span class="fx fx-dmg">${icon('sword')}<b>${v}</b>${verbose ? ` ${t('move.fx.damage')}` : ''}</span>`);
  }
  if (m.block) {
    const n = values.block(m);
    parts.push(`<span class="fx fx-block">${icon('shield')}<b>${n}</b>${verbose ? ` ${t('kw.block')}` : ''}</span>`);
  }
  if (m.heal) {
    const n = values.heal(m);
    parts.push(`<span class="fx fx-bad">${icon('heart')}<b>+${n}</b>${verbose ? ` ${t('move.fx.heal')}` : ''}</span>`);
  }
  if (m.drainMana) parts.push(`<span class="fx fx-mana" data-rule="drain">${icon('crystal')}${t('move.fx.drain', { n: m.drainMana })}</span>`);
  for (const st of m.status ?? []) {
    // Tone from the player's point of view: an enemy buff or a debuff on the hero is bad news.
    const bad = st.target === 'hero' ? !STATUSES[st.id].good : STATUSES[st.id].good;
    const { tone, chip, icon: ico } = STATUSES[st.id];
    const name = chip === 'icon' ? '' : `${chip === 'short' ? t(`status.${st.id}.short`) : statusName(st.id, st.target)} `;
    parts.push(
      `<span class="fx ${bad ? 'fx-bad' : 'fx-good'}" data-tone="${tone}" data-status="${st.id}" data-side="${st.target}" data-v="${st.v ?? 1}">${icon(ico)}${name}<b>${st.t ? `${st.t}s` : `+${st.v ?? 1}`}</b></span>`,
    );
  }
  // Each curse names its card, so the handbook can open it on a press.
  for (const cu of m.curse ?? []) {
    const card = t(`card.${cu.id}.name`);
    const n = cu.n > 1 ? ` ×${cu.n}` : '';
    parts.push(
      `<span class="fx fx-curse" data-card="${cu.id}">${icon(cu.hex ? HEXES[cu.hex].icon : 'skull')}${verbose ? t('move.fx.adds', { card }) : card}<b>${n}</b></span>`,
    );
  }
  if (m.swap) {
    const card = t(`card.${m.swap}.name`);
    parts.push(`<span class="fx fx-curse" data-card="${m.swap}">${icon('skull')}${verbose ? t('move.fx.swap', { card }) : card}</span>`);
  }
  if (m.inflate) parts.push(`<span class="fx fx-bad" data-rule="inflation">${icon('inflation')}${t('move.fx.inflate', { n: m.inflate })}</span>`);
  if (m.infect)
    parts.push(`<span class="fx fx-bad" data-tone="green" data-rule="virus">${icon('virus')}${t('move.fx.infect', { n: m.infect })}</span>`);
  if (m.absorb) parts.push(`<span class="fx fx-block" data-rule="copy">${icon('scanner')}${t('move.fx.absorb')}</span>`);
  if (m.release) parts.push(`<span class="fx fx-dmg" data-rule="copy">${icon('copy')}${t('move.fx.release')}</span>`);
  if (m.task) parts.push(`<span class="fx" data-tone="amber" data-rule="${m.task}">${icon(RULES[m.task].icon)}${t('move.fx.task')}</span>`);
  if (m.intent === 'idle') parts.push(`<span class="fx">${t('move.fx.idle')}</span>`);
  if (m.hex) {
    const n = t('move.fx.hexShare', { n: Math.round(m.hex.share * 100) });
    parts.push(`<span class="fx fx-curse" data-hex="${m.hex.id}">${icon(HEXES[m.hex.id].icon)}${t(`hex.${m.hex.id}`)} <b>${n}</b></span>`);
  }
  if (m.steal) parts.push(`<span class="fx" data-tone="amber">${icon('snatch')}${t('compendium.steal')}</span>`);
  return parts.join(' ');
}

/**
 * An enemy's whole attack pattern: the main attack, the specials it uses in turn, then its passives and enrage; a boss with phases lists each one under its own heading.
 * In a fight, `mark` highlights the move being charged and the next special.
 */
export function movePattern(e: EnemyDef, values: MoveValues = baseValues, mark?: { now: MoveDef; next: MoveDef | null }): string {
  const row = (m: MoveDef): string => {
    const cls = m === mark?.now ? 'now' : m === mark?.next ? 'next' : '';
    const tone = moveTone(m);
    return `<li class="${cls}" data-intent="${m.intent}"${tone ? ` data-tone="${tone}"` : ''}><span class="mi">${icon(moveIcon(m))}</span><span class="mn">${t(`move.${m.id}`)}</span><span class="me">${moveEffect(m, false, values)}</span><span class="mt">${m.windup.toFixed(1)}s</span></li>`;
  };
  const moves = (p: Pick<EnemyDef, 'main' | 'specials' | 'every'>): string =>
    `${row(p.main)}${p.specials.length ? `<li class="foe-every">${t('compendium.every', { n: p.every })}</li>` : ''}${p.specials.map(row).join('')}`;
  const traits = enemyTraits(e)
    .map((x) => `<p class="foe-half">${icon(x.icon)}${x.name ? `<b>${x.name}</b><i class="sep"></i>` : ''}<span>${x.desc}</span></p>`)
    .join('');
  if (!e.phases) return `<ul class="foe-moves">${moves(e)}</ul>${traits}`;
  const phases = [e, ...e.phases]
    .map(
      (p, i) =>
        `<li class="foe-phase"><b>${t('compendium.phase', { n: i + 1 })}</b> ${keywordHtml(t(`enemy.${e.id}.phase${i + 1}.d`))}</li>${moves(p)}`,
    )
    .join('');
  return `<ul class="foe-moves">${phases}</ul>${traits}`;
}

/**
 * The colour of a move, from what it does to you first (damage, the status it puts on you, curses, theft…), then what it does for
 * itself (Block, healing, a buff): Snark, which poisons, is green. Idle moves have none (the bar stays grey).
 */
export function moveTone(m: MoveDef): Tone | null {
  if (m.intent === 'idle') return null;
  const onHero = m.status?.find((s) => s.target === 'hero');
  if (m.intent === 'defend' && m.block) return 'teal';
  if (m.dmg || m.release) return 'red';
  if (onHero) return STATUSES[onHero.id].tone;
  if (m.infect) return 'green';
  if (m.inflate) return 'red';
  if (m.curse || m.hex || m.swap) return 'purple';
  if (m.steal) return 'amber';
  if (m.drainMana) return 'blue';
  if (m.absorb) return 'mint';
  if (m.block) return 'teal';
  if (m.heal) return 'green';
  if (m.status?.length) return STATUSES[m.status[0].id].tone;
  return null;
}

/** A move's icon: its intent's, or the status's own when applying one status is all it does (Snark: Poison). */
export function moveIcon(m: MoveDef): string {
  const st = m.status?.length === 1 ? m.status[0] : undefined;
  const only = st && !m.dmg && !m.block && !m.heal && !m.curse && !m.hex && !m.steal && !m.inflate && !m.infect && !m.swap && !m.drainMana;
  return only ? STATUSES[st.id].icon : (INTENT_ICON[m.intent] ?? 'star');
}

/** Icon of an enemy's half-HP trait (traits list, status row). */
export const HALF_ICON = 'rage';

/**
 * What an enemy does beyond its moves: passive statuses, what it does to the belt or mana, and what happens at half HP.
 * The handbook lists everything; `inFight` (the lines before the fight starts) leaves out the surprises.
 */
export function enemyTraits(e: EnemyDef, inFight = false): { icon: string; name: string; desc: string }[] {
  const traits = (e.start ?? [])
    .filter((s) => STATUSES[s.id].passive && !(inFight && STATUSES[s.id].hidden))
    .map((s) => ({ icon: STATUSES[s.id].icon, name: t(`status.${s.id}`), desc: keywordHtml(t(`status.${s.id}.d`, { v: s.v ?? 1 })) }));
  if (e.fillSleeve) traits.push({ icon: 'hand', name: t(`card.${e.fillSleeve}.name`), desc: t('enemy.fillSleeve') });
  if (e.startHex) {
    const { id, share } = e.startHex;
    traits.push({ icon: HEXES[id].icon, name: t(`hex.${id}`), desc: t('enemy.startHex', { n: Math.round(share * 100) }) });
  }
  if (!inFight) {
    if (e.deepBelt !== undefined) traits.push({ icon: 'conveyorLine', name: '', desc: keywordHtml(t(`enemy.${e.id}.deep`)) });
    if (e.beltOff !== undefined) traits.push({ icon: 'crank', name: '', desc: t(`enemy.${e.id}.off`) });
    if (e.manaTap !== undefined) traits.push({ icon: 'crystal', name: '', desc: t(`enemy.${e.id}.tap`) });
  }
  if (e.minigame) traits.push({ icon: 'kanban', name: '', desc: t(`enemy.${e.id}.game`) });
  if (e.onHalf && !(inFight && e.halfSecret))
    traits.push({ icon: HALF_ICON, name: t('status.half', { n: halfPct(e) }), desc: keywordHtml(t(`enemy.${e.id}.half`)) });
  return traits;
}

/** Rules a move can bring that aren't statuses or cards, explained on a press. */
export const RULES: Record<string, { icon: string; title: TKey; desc: TKey }> = {
  inflation: { icon: 'inflation', title: 'rule.inflation', desc: 'rule.inflation.d' },
  virus: { icon: 'virus', title: 'rule.virus', desc: 'rule.virus.d' },
  drain: { icon: 'drain', title: 'rule.drain', desc: 'rule.drain.d' },
  copy: { icon: 'scanner', title: 'rule.copy', desc: 'rule.copy.d' },
  coffee: { icon: 'coffee', title: 'rule.task', desc: 'rule.task.d' },
  shells: { icon: 'gavel', title: 'rule.shells', desc: 'rule.shells.d' },
  sushi: { icon: 'sushiPlate', title: 'rule.sushi', desc: 'rule.sushi.d' },
  badge: { icon: 'idBadge', title: 'rule.badge', desc: 'rule.badge.d' },
};

/** Inside a move description (threat info, handbook): press a curse, status, hex or rule to learn what it does. */
export function bindMoveDetails(root: HTMLElement): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-card], [data-status], [data-hex], [data-rule]')) {
    onPress(el, () => {
      sfx('tap');
      const { card, status, v, hex, rule, side } = el.dataset;
      if (card) openCardDetail({ uid: -1, id: card, up: false });
      else if (status) {
        const def = STATUSES[status];
        const on = side === 'hero' ? 'hero' : 'enemy';
        openInfo({
          icon: statusIcon(status, on),
          title: statusName(status, on),
          desc: statusDesc(status, on, Number(v ?? 1)),
          ink: def.good ? 'good' : 'bad',
        });
      } else if (hex) openInfo({ icon: HEXES[hex].icon, title: t(`hex.${hex}`), desc: t(`hex.${hex}.d`, { n: HEXES[hex].taps }), ink: 'bad' });
      else if (rule && RULES[rule])
        openInfo({ icon: RULES[rule].icon, title: t(RULES[rule].title), desc: keywordHtml(t(RULES[rule].desc)), ink: 'bad' });
    });
  }
}

/** An enemy's sheet: portrait, tier, HP and its move pattern; an unmet enemy (`met` false) stays a blank silhouette. */
export function foeView(e: EnemyDef, met: boolean): HTMLElement {
  const el = h('article', {
    class: `foe${met ? '' : ' undiscovered'}`,
    html: `<div class="foe-head"><div class="foe-art" data-act="${e.act}">${creature(e.art)}</div><div class="foe-id"><h3>${met ? t(`enemy.${e.id}.name`) : UNKNOWN}</h3>${
      e.tier !== 'normal' ? `<span class="tier ${e.tier}">${t(`journey.node.${e.tier}`)}</span>` : ''
    }<span class="foe-hp">${icon('heart')}${Math.round(e.hp * CONFIG.enemyHp)}${e.block ? `<i class="foe-block">${icon('shield')}${e.block}</i>` : ''}</span></div></div>${met ? movePattern(e) : ''}`,
  });
  bindMoveDetails(el);
  return el;
}
