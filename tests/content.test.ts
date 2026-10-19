import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CREATURES } from '../src/ui/art/creatures';
import { MOODS, moodId } from '../src/ui/art/heroMoods';
import { stageArt } from '../src/ui/art/stageArt';
import enStrings from '../src/i18n/en';
import esStrings from '../src/i18n/es';
import itStrings from '../src/i18n/it';
import zhStrings from '../src/i18n/zh';

/** Indexed as a plain dictionary: these tests check keys that are built at runtime. */
const en: Record<string, string> = enStrings;
import { CARD_LIST, CARDS } from '../src/data/cards';
import { cardHidden, heroHidden, heroUnlocked, progress, stampAct } from '../src/game/meta';
import type { HeroId } from '../src/game/types';
import { KEYWORD_LIST } from '../src/ui/components/cardView';
import { ACT_DEFS, MAIN_ACTS } from '../src/data/acts';
import { rewardOdds, rewardUpgradeChance } from '../src/data/config';
import { DIFFICULTY, ENEMY_LIST, enemyMoves } from '../src/data/enemies';
import { HERO_LIST, HEROES, starterCards } from '../src/data/heroes';
import { VALUES } from '../src/data/values';
import { PERK_LIST, PERKS } from '../src/data/perks';
import { WHEEL } from '../src/data/wheel';
import { STATUS_ORDER, STATUSES } from '../src/data/statuses';
import { cardText, GLYPHS, TAG_ICON } from '../src/ui/components/cardView';
import { RULES, enemyTraits, moveTone } from '../src/ui/components/moveText';
import { ICONS, INTENT_ICON } from '../src/ui/art/icons';
import { CARD_ART } from '../src/ui/art/cardArt';
import { RELIC_SPRITES } from '../src/ui/art/relics';
import { ROOM_SPRITES } from '../src/ui/art/rooms';
import { ROOM_SCENE } from '../src/ui/components/room';
import { INK_HEX } from '../src/ui/art/riso';
import { HEXES } from '../src/data/hexes';
import { COFFEE_DRINKS, COFFEE_ITEMS } from '../src/data/coffee';
import { MODIFIER_LIST } from '../src/data/modifiers';
import { rankMax, rankSteps } from '../src/data/rank';
import { rewardPool } from '../src/data/cards';
import { DEBUG_ENEMY, ENEMIES } from '../src/data/enemies';
import { CHORES } from '../src/game/chore';
import { MINIGAMES } from '../src/game/minigame';
import { CONFIG } from '../src/data/config';
import { KIND_ICONS } from '../src/ui/combat/match3Window';
import { Rng } from '../src/core/rng';
import { RELIC_LIST } from '../src/data/relics';
import { ABILITY_ICON, PASSIVE_ICON } from '../src/ui/combat/view';
import { NODE_ICON } from '../src/ui/screens/journey';

describe('content integrity', () => {
  it('every card has i18n text and valid face glyphs', () => {
    for (const c of CARD_LIST) {
      expect(en[`card.${c.id}.name`], c.id).toBeTruthy();
      expect(en[`card.${c.id}.desc`], c.id).toBeTruthy();
      if (c.tip) expect(en[`card.${c.id}.tip` as keyof typeof en], `${c.id}: tip`).toBeTruthy();
      for (const m of c.face.matchAll(/\{([?*!])?([\w+]+)(?::\d)?\}/g)) {
        // A condition or a trigger names what to look for: it carries no value.
        if (m[1] && m[1] !== '!') expect(m[0], `${c.id}: ${m[0]} carries a value`).not.toContain(':');
        for (const g of m[2].split('+')) {
          if (/^\d$/.test(g)) continue;
          expect(GLYPHS[g], `${c.id}: ${g}`).toBeTruthy();
        }
      }
      for (const m of en[`card.${c.id}.desc`].matchAll(/\[(\w+)\]/g)) expect(en[`kw.${m[1]}`], `${c.id}: kw ${m[1]}`).toBeTruthy();
    }
  });

  it('every card text in every language is fully filled in by the card view: only {0}-style values and {$name}s, no plural forms', () => {
    for (const [code, strings] of Object.entries({ en: enStrings, it: itStrings, es: esStrings, zh: zhStrings } as Record<
      string,
      Record<string, string>
    >))
      for (const c of CARD_LIST) {
        const left = strings[`card.${c.id}.desc`].replace(/\{\d\}/g, '').replace(/\{\$\w+\}/g, '');
        expect(left, `${code} ${c.id}: a placeholder the card view does not fill in`).not.toMatch(/[{}]/);
      }
  });

  it('every enemy and move has a name, every hero deck exists', () => {
    for (const e of ENEMY_LIST) {
      expect(en[`enemy.${e.id}.name`], e.id).toBeTruthy();
      expect(DIFFICULTY, `${e.id} missing from DIFFICULTY`).toContain(e.id);
      for (const m of enemyMoves(e)) expect(en[`move.${m.id}`], m.id).toBeTruthy();
    }
    const ids = new Set(CARD_LIST.map((c) => c.id));
    for (const h of HERO_LIST) for (const id of h.startDeck) expect(ids.has(id), id).toBe(true);
    for (const c of CARD_LIST)
      for (const m of en[`card.${c.id}.desc`].matchAll(/\[@(\w+)\]/g)) expect(ids.has(m[1]) && m[1] !== c.id, `${c.id} names ${m[1]}`).toBe(true);
    for (const c of CARD_LIST)
      if (c.starterOnly)
        expect(
          HERO_LIST.some((h) => h.startDeck.includes(c.id)),
          c.id,
        ).toBe(true);
    for (const h of HERO_LIST) {
      // A single copy of each listed starter starts upgraded.
      const up = starterCards(h).filter((c) => c.up);
      expect(
        up.map((c) => c.id),
        h.id,
      ).toEqual(h.startUpgraded);
    }
  });

  it("the coffee chore's drinks and steps are named in every language, and the Slaves CEO's coffee move is a chore", () => {
    const keys = [
      ...COFFEE_ITEMS.map((i) => `task.coffee.${i}`),
      ...COFFEE_DRINKS.map((d) => `drink.${d}`),
      ...['coins', 'code', 'place', 'sugar', 'brew', 'done'].map((p) => `task.coffee.step.${p}`),
    ];
    for (const strings of [enStrings, itStrings, esStrings, zhStrings] as Record<string, string>[])
      for (const k of keys) expect(strings[k], k).toBeTruthy();
    expect(ENEMIES.slavesCeo.specials.some((m) => m.task === 'coffee')).toBe(true);
  });

  it('every enemy that sets a chore has a chore to make, its lines and its texts in every language', () => {
    const chores = ENEMY_LIST.flatMap((e) => enemyMoves(e).flatMap((m) => (m.task ? [{ enemy: e.id, task: m.task }] : [])));
    expect(new Set(chores.map((c) => c.task))).toEqual(new Set(Object.keys(CHORES)));
    for (const { enemy, task } of chores) {
      expect(CHORES[task](new Rng(1)).id, task).toBe(task);
      expect(RULES[task], task).toBeTruthy();
      for (const k of [`enemy.${enemy}.order`, `enemy.${enemy}.calm`, `task.${task}.title`, RULES[task].title, RULES[task].desc])
        for (const strings of [enStrings, itStrings, esStrings, zhStrings] as Record<string, string>[]) expect(strings[k], k).toBeTruthy();
    }
  });

  it('every minigame an enemy leaves open has a game to make, its pieces drawn and its texts in every language', () => {
    const games = ENEMY_LIST.flatMap((e) => (e.minigame ? [{ enemy: e.id, game: e.minigame }] : []));
    expect(new Set(games.map((g) => g.game))).toEqual(new Set(Object.keys(MINIGAMES)));
    for (const { enemy, game } of games) {
      expect(MINIGAMES[game](new Rng(1)).id, game).toBe(game);
      for (const k of [
        `enemy.${enemy}.game`,
        `task.${game}.title`,
        `task.${game}.cleared`,
        `task.${game}.hint`,
        `task.${game}.piece`,
        'combat.minigame',
        'combat.minigame.close',
      ])
        for (const strings of [enStrings, itStrings, esStrings, zhStrings] as Record<string, string>[]) expect(strings[k], k).toBeTruthy();
    }
    expect(KIND_ICONS).toHaveLength(CONFIG.match3.kinds);
    for (const id of [...KIND_ICONS, 'copy', 'kanban']) expect(ICONS[id], id).toBeTruthy();
  });

  it('every enemy tells something about itself before the fight, unless its trait is a surprise, and a note has its icon and texts in every language', () => {
    for (const e of ENEMY_LIST) {
      const surprise =
        e.halfSecret || e.deepBelt !== undefined || e.beltOff !== undefined || e.manaTap !== undefined || e.start?.some((s) => STATUSES[s.id].hidden);
      if (!surprise && !e.firstRunOnly) expect(enemyTraits(e, true).length, e.id).toBeGreaterThan(0);
      if (!e.note) continue;
      expect(ICONS[e.note], e.id).toBeTruthy();
      for (const strings of [enStrings, itStrings, esStrings, zhStrings] as Record<string, string>[])
        expect(strings[`enemy.${e.id}.note`], e.id).toBeTruthy();
    }
  });

  it('rules texts mark every keyword they name, so every place that shows them highlights it alike', () => {
    const rules =
      /^(card\.\w+\.(desc|tip)|status\.\w+(\.self)?\.d|relic\.\w+\.d|perk\.\w+\.d|hero\.\w+\.(passive|ability)Short|kw\.\w+\.d|rule\.\w+\.d|enemy\.\w+\.(half|note|game|deep|off|tap|phase\d\.d)|beg\.body)$/;
    const bare = /\b(Block|Poison|Strength|Burn|Dodge|Vulnerable|Weak|Stun|Chill|Thorns|Parry|Fleeting|Innate)\b/;
    for (const [key, text] of Object.entries(en)) if (rules.test(key)) expect(text.replace(/\[\w+\]/g, ''), key).not.toMatch(bare);
  });

  it('the handbook lists every keyword the game explains', () => {
    const explained = Object.keys(en)
      .filter((k) => /^kw\.\w+$/.test(k))
      .map((k) => k.slice(3));
    expect([...KEYWORD_LIST].sort()).toEqual(explained.sort());
  });

  it('Legendary cards are offered only after elites and bosses, and every act pays better than the one before', () => {
    const share = (kind: 'fight' | 'elite', act: number): number => {
      const odds = rewardOdds(kind, act);
      return 1 - odds.filter(([r]) => r === 'common').reduce((n, [, w]) => n + w, 0) / odds.reduce((n, [, w]) => n + w, 0);
    };
    for (let act = 1; act <= ACT_DEFS.length; act++) {
      expect(rewardOdds('fight', act).some(([r]) => r === 'legendary')).toBe(false);
      expect(rewardOdds('elite', act).some(([r]) => r === 'legendary')).toBe(true);
      expect(rewardOdds('boss', act).every(([r]) => r === 'legendary')).toBe(true);
      if (act > 1) {
        for (const r of ['common', 'rare', 'epic', 'legendary'] as const)
          expect(rewardUpgradeChance(r, act)).toBeGreaterThan(rewardUpgradeChance(r, act - 1));
        expect(share('fight', act)).toBeGreaterThan(share('fight', act - 1));
        expect(share('elite', act)).toBeGreaterThan(share('elite', act - 1));
      }
    }
  });

  it('the Debug Enemy can be fought and is named, but is in no list', () => {
    expect(ENEMIES[DEBUG_ENEMY.id]).toBe(DEBUG_ENEMY);
    expect(ENEMY_LIST).not.toContain(DEBUG_ENEMY);
    expect(DIFFICULTY).not.toContain(DEBUG_ENEMY.id);
    for (const strings of [enStrings, itStrings, esStrings, zhStrings] as Record<string, string>[]) {
      expect(strings[`enemy.${DEBUG_ENEMY.id}.name`]).toBeTruthy();
      expect(strings[`move.${DEBUG_ENEMY.main.id}`]).toBeTruthy();
    }
    expect(CREATURES[DEBUG_ENEMY.art]).toBeTruthy();
  });

  it('every hero has a face for every mood, and every act a scene behind its fights', () => {
    for (const h of HERO_LIST) for (const m of MOODS) expect(CREATURES[moodId(h.id, m)], `${h.id} ${m}`).toBeTruthy();
    for (const [i] of ACT_DEFS.entries()) expect(stageArt(i + 1), `act ${i + 1}`).toContain('<rect');
    expect(new Set(ACT_DEFS.map((_, i) => stageArt(i + 1))).size, 'one scene per act').toBe(ACT_DEFS.length);
  });

  it('every enemy with a half-HP trait has an angrier face to change into', () => {
    for (const e of ENEMY_LIST.filter((x) => x.onHalf)) expect(CREATURES[e.halfArt ?? ''], e.id).toBeTruthy();
  });

  it('every phase of a boss has its sprite, its lines in every language, falls below the one before, and a belt', () => {
    for (const e of ENEMY_LIST.filter((x) => x.phases)) {
      expect(e.tier, e.id).toBe('boss');
      expect(CREATURES[e.art], e.id).toBeTruthy();
      let at = 1;
      for (const [i, p] of e.phases!.entries()) {
        expect(p.at, e.id).toBeLessThan(at);
        at = p.at;
        expect(CREATURES[p.art], p.art).toBeTruthy();
        expect(p.belt.rows).toBeGreaterThan(0);
        for (const strings of [enStrings, itStrings, esStrings, zhStrings] as Record<string, string>[])
          for (const k of [`enemy.${e.id}.phase${i + 2}`, `enemy.${e.id}.phase${i + 2}.d`, `enemy.${e.id}.phase1.d`])
            expect(strings[k], k).toBeTruthy();
      }
    }
  });

  it('every enemy past the first three can grow stronger, except the ones with nothing to hit with or a single move', () => {
    const exempt = ['toxicCoworker', 'guyAsleep', 'overthinker'];
    for (const e of ENEMY_LIST.slice(3)) {
      const grows = enemyMoves(e).some((m) => m.status?.some((s) => s.id === 'strength' && s.target === 'enemy'));
      expect(grows, e.id).toBe(!exempt.includes(e.id));
    }
  });

  it('cards whose main effect is healing cost at least 2 and exhaust (potions are consumed instead; a power is spent once played anyway)', () => {
    const healers = CARD_LIST.filter(
      (c) => c.type !== 'curse' && c.type !== 'power' && !c.sushi && !c.keywords?.includes('consume') && /^\{(heal|regen)|^\{undo\}/.test(c.face),
    );
    expect(healers.length).toBeGreaterThan(5);
    for (const c of healers) {
      expect(c.cost, `${c.id}: cost`).toBeGreaterThanOrEqual(2);
      expect(c.keywords, `${c.id}: exhaust`).toContain('exhaust');
    }
  });

  it('elites and bosses start the fight with Block (a normal enemy may too)', () => {
    for (const e of ENEMY_LIST) if (e.tier !== 'normal') expect(e.block, e.id).toBeGreaterThan(0);
  });

  it('every card has its own art, never shared with another card or a rule icon', () => {
    const rules = new Set([
      ...Object.values(GLYPHS).map((g) => g.icon),
      ...STATUS_ORDER.map((id) => STATUSES[id].icon),
      ...Object.values(INTENT_ICON),
      ...Object.values(TAG_ICON),
      ...PERK_LIST.map((p) => p.icon),
      ...Object.values(HEXES).map((x) => x.icon),
      ...Object.values(ABILITY_ICON),
      ...Object.values(PASSIVE_ICON),
      ...Object.values(NODE_ICON),
    ]);
    const seen = new Map<string, string>();
    for (const c of CARD_LIST) {
      expect(ICONS[c.art], `${c.id}: missing icon ${c.art}`).toBeTruthy();
      expect(seen.get(c.art), `${c.id} and ${seen.get(c.art)} share ${c.art}`).toBeUndefined();
      expect(rules.has(c.art), `${c.id} uses the rule icon ${c.art}`).toBe(false);
      seen.set(c.art, c.id);
    }
  });

  it('a card painting belongs to a real card, a large card has a wide one, and every Warrior card has one', () => {
    for (const [id, p] of Object.entries(CARD_ART)) {
      const def = CARD_LIST.find((c) => c.id === id);
      expect(def, `${id}: a painting for no card`).toBeTruthy();
      expect(!!p.wide, `${id}: a large card's painting is wide, no other is`).toBe(!!def?.keywords?.includes('large'));
      expect(p.svg.includes('<defs>'), `${id}: missing gradient defs`).toBe(true);
      const used = [...p.svg.matchAll(/url\(#(\w+)\)/g)].map((m) => m[1]);
      for (const u of used) expect(p.svg.includes(`id="${u}"`), `${id}: gradient ${u} is not defined`).toBe(true);
    }
    for (const c of CARD_LIST.filter((c) => c.cls === 'warrior')) expect(CARD_ART[c.id], `${c.id}: no painting yet`).toBeTruthy();
  });

  it('a hero whose passive is a status points at a real, timed one that drains', () => {
    for (const h of HERO_LIST) {
      if (!h.passiveStatus) continue;
      const def = STATUSES[h.passiveStatus];
      expect(def, `${h.id}: ${h.passiveStatus}`).toBeTruthy();
      expect(def.kind === 'timed' && def.span && def.span > 0, `${h.passiveStatus} needs a span`).toBeTruthy();
    }
  });

  it('every act boss wears an icon of its own on the map', () => {
    const icons = ACT_DEFS.map((d) => (d.bossClock ? 'clock' : (d.bossIcon ?? 'default')));
    expect(new Set(icons).size).toBe(ACT_DEFS.length);
    for (const d of ACT_DEFS) if (d.bossIcon) expect(ICONS[d.bossIcon], d.bossIcon).toBeTruthy();
  });

  it('every relic has a name, a text, a sprite and a chip icon of its own', () => {
    for (const r of RELIC_LIST) {
      expect(en[`relic.${r.id}.name`] && en[`relic.${r.id}.d`], r.id).toBeTruthy();
      expect(RELIC_SPRITES[`relic.${r.id}`], `${r.id}: missing sprite`).toBeTruthy();
      expect(ICONS[`relic.${r.id}`], `${r.id}: missing chip icon`).toBeTruthy();
    }
    expect(Object.keys(RELIC_SPRITES).length).toBe(RELIC_LIST.length);
  });

  it('every room picture has a sprite (and its second frame, if it has one)', () => {
    for (const [type, scene] of Object.entries(ROOM_SCENE)) {
      expect(ROOM_SPRITES[`room.${type}`], `${type}: missing sprite`).toBeTruthy();
      if (scene.alt) expect(ROOM_SPRITES[`room.${type}.open`], `${type}: missing second frame`).toBeTruthy();
    }
    expect(Object.keys(ROOM_SPRITES).length).toBe(Object.keys(ROOM_SCENE).length + Object.values(ROOM_SCENE).filter((s) => s.alt).length);
  });

  it('every management memo has a name, a text and an icon, and changes something', () => {
    for (const m of MODIFIER_LIST) {
      expect(en[`memo.${m.id}.name`] && en[`memo.${m.id}.d`], m.id).toBeTruthy();
      expect(ICONS[m.icon], `${m.id}: missing icon ${m.icon}`).toBeTruthy();
      expect(m.enemyHp ?? m.enemyDmg ?? m.beltMul ?? m.heroHp ?? m.restHeal ?? m.rewardCards, `${m.id} does nothing`).toBeDefined();
    }
  });

  it('every career ladder is complete: a title for each rank, a text for each effect, and gifts that can be given', () => {
    for (let level = 0; level <= 10; level++) expect(en[`rank.${level}`], `rank.${level}`).toBeTruthy();
    expect(ICONS.ladder).toBeTruthy();
    for (const hero of HERO_LIST) {
      const max = rankMax(hero.id);
      if (!max) continue;
      expect(max, hero.id).toBe(10);
      for (const [i, step] of rankSteps(hero.id, max).entries()) {
        for (const e of [step.bonus, step.duty]) {
          const key = e.kind === 'cards' ? `cards.${e.rarity}` : e.kind;
          expect(en[`rank.fx.${key}`], `${hero.id} rank ${i + 1}: rank.fx.${key}`).toBeTruthy();
          if (e.kind === 'cards')
            expect(rewardPool(hero.id, e.rarity).length, `${hero.id} rank ${i + 1}: no ${e.rarity} card to give`).toBeGreaterThanOrEqual(e.n);
          if (e.kind === 'upgrade') {
            for (const id of e.cards) {
              expect(hero.startDeck, `${hero.id} rank ${i + 1}: ${id} is not in the starter deck`).toContain(id);
              expect(hero.startUpgraded, `${hero.id} rank ${i + 1}: ${id} starts upgraded already`).not.toContain(id);
              expect(CARDS[id].upVals ?? CARDS[id].upCost ?? CARDS[id].upKeywords, `${id} has no upgrade`).toBeDefined();
            }
          }
        }
      }
    }
  });

  it('every perk and status has a name and a description', () => {
    for (const p of PERK_LIST) expect(en[`perk.${p.id}`] && en[`perk.${p.id}.d`], p.id).toBeTruthy();
    for (const id of STATUS_ORDER) expect(en[`status.${id}`] && en[`status.${id}.d`], id).toBeTruthy();
  });

  it("every slice of the Raffle's wheel has an icon, a real perk or a name of its own, and the wheel has one unlucky perk at least", () => {
    for (const s of WHEEL) {
      expect(ICONS[s.icon], `${s.id}: missing icon ${s.icon}`).toBeTruthy();
      if (s.effect.kind === 'perk') expect(PERKS[s.effect.perk], `${s.id}: unknown perk`).toBeTruthy();
      else expect(en[`wheel.${s.id}`] && en[`wheel.${s.id}.d`], s.id).toBeTruthy();
    }
    expect(WHEEL.some((s) => s.effect.kind === 'perk' && PERKS[s.effect.perk].bad)).toBe(true);
  });
});

describe('colours', () => {
  const tokens = readFileSync('src/styles/tokens.css', 'utf8');
  const token = (name: string): string | undefined => new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`).exec(tokens)?.[1];

  it('colours are written only in tokens.css and acts.css', () => {
    for (const file of readdirSync('src/styles').filter((f) => f.endsWith('.css') && f !== 'tokens.css' && f !== 'acts.css')) {
      const hexes = readFileSync(`src/styles/${file}`, 'utf8').match(/#[0-9a-fA-F]{3,8}\b/g);
      expect(hexes, `${file} has raw colours: use a token`).toBeNull();
    }
  });

  it('every status has a tone, and every tone has its two inks and its data-tone rule in tokens.css', () => {
    const tones = ['red', 'green', 'purple', 'blue', 'teal', 'amber', 'mint', 'toxic', 'magenta', 'pink'];
    for (const id of STATUS_ORDER) expect(tones, id).toContain(STATUSES[id].tone);
    for (const tone of tones) {
      expect(tokens, tone).toContain(`--tone-${tone}:`);
      expect(tokens, tone).toContain(`--tone-${tone}-hi:`);
      expect(tokens, tone).toContain(`[data-tone='${tone}']`);
    }
  });

  it('an enemy move takes the colour of what it does', () => {
    expect(moveTone(ENEMIES.toxicCoworker.specials[1])).toBe('toxic');
    expect(moveTone(ENEMIES.seniorBoomer.main)).toBe('red');
    expect(moveTone(ENEMIES.hrOrientationVideo.specials[0])).toBe('teal');
    for (const e of ENEMY_LIST) for (const m of enemyMoves(e)) if (m.intent !== 'idle') expect(moveTone(m), `${e.id}.${m.id}`).not.toBeNull();
  });

  it('every inks-with-transparency token starts with its base ink', () => {
    const base: Record<string, string | undefined> = {
      void: token('--void'),
      k: token('--k'),
      paper: token('--paper'),
      p: token('--p'),
      white: '#ffffff',
    };
    for (const m of tokens.matchAll(/--(\w+)-a\d+:\s*(#[0-9a-fA-F]{8})/g)) expect(m[2].slice(0, 7).toLowerCase(), m[0]).toBe(base[m[1]]);
  });

  it('the pixel renderer prints with the inks of the stylesheet', () => {
    expect(INK_HEX).toEqual({ Y: token('--y'), P: token('--p'), B: token('--b'), K: token('--k') });
  });
});

describe('one ink per thing', () => {
  it('a card glyph has the tone of the status it stands for', () => {
    const status: Record<string, string> = {
      str: 'strength',
      vuln: 'vulnerable',
      fort: 'fortified',
      auto: 'autopilot',
      multi: 'multitasking',
      selfStun: 'stun',
      snow: 'chill',
    };
    for (const [kind, g] of Object.entries(GLYPHS)) {
      const st = STATUSES[status[kind] ?? kind];
      // The hero's own stun reads differently (asleep): its glyph takes the status's `selfTone`.
      if (st && g.tone) expect(g.tone, kind).toBe(kind === 'selfStun' ? st.selfTone : st.tone);
    }
  });
});

describe('a status with its own name on the hero', () => {
  it('has the hero-side strings', () => {
    for (const s of STATUS_ORDER.map((id) => STATUSES[id]).filter((d) => d.selfName)) {
      expect(en[`status.${s.id}.self`], s.id).toBeTruthy();
      expect(en[`status.${s.id}.self.d`], s.id).toBeTruthy();
    }
  });
});

describe('numbers in rules text', () => {
  const used = new Set(Object.values(en).flatMap((text) => [...text.matchAll(/\{\$(\w+)\}/g)].map((m) => m[1])));

  it('every {$name} in a string is a value the game provides, and every value is used', () => {
    for (const name of used) expect(name in VALUES, `{$${name}} is not in VALUES`).toBe(true);
    for (const name of Object.keys(VALUES)) expect(used.has(name), `${name} is in VALUES but no string uses it`).toBe(true);
  });

  it('every value is a plain number', () => {
    for (const [name, v] of Object.entries(VALUES)) expect(Number.isFinite(v), name).toBe(true);
  });
});

describe('translations', () => {
  const holes = (text: string): string[] => [...text.matchAll(/\{\$?\w+(?=[|}])|\[@?\w+\]/g)].map((m) => m[0]).sort();

  const others: Record<string, Record<string, string>> = { it: itStrings, es: esStrings, zh: zhStrings };
  for (const [code, dict] of Object.entries(others)) {
    it(`${code} has the same keys and the same placeholders, values and keywords as English`, () => {
      expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
      for (const [key, text] of Object.entries(en)) expect(holes(dict[key]), `${code} ${key}`).toEqual(holes(text));
    });
  }
});

describe('the Rogue', () => {
  it('a hero still in the works stays hidden, with all its cards, until the debug unlock-all hires them', () => {
    const real = HEROES.rogue.unlock;
    HEROES.rogue.unlock = { debug: true };
    try {
      expect(heroUnlocked('rogue')).toBe(false);
      expect(heroHidden('rogue')).toBe(true);
      const own = CARD_LIST.filter((c) => c.cls === 'rogue');
      expect(own.length).toBeGreaterThan(0);
      for (const c of own) expect(cardHidden(c.id), c.id).toBe(true);
      expect(cardHidden('punch')).toBe(false);
      // No progress can hire them: only unlock-all does.
      progress(() => true);
      expect(heroHidden('rogue')).toBe(true);
    } finally {
      HEROES.rogue.unlock = real;
    }
  });

  it('is hired once every other hero has beaten the last act', () => {
    expect(HEROES.rogue.unlock).toEqual({ allStamped: MAIN_ACTS });
    expect(heroHidden('rogue')).toBe(false);
    expect(heroUnlocked('rogue')).toBe(false);
    progress(() => false);
    expect(heroUnlocked('rogue')).toBe(false);
    for (const hero of ['warrior', 'mage']) stampAct(hero as HeroId, MAIN_ACTS);
    expect(progress(() => false)).toEqual([]);
    stampAct('necromancer', MAIN_ACTS);
    expect(progress(() => false)).toEqual(['rogue']);
    expect(heroUnlocked('rogue')).toBe(true);
  });

  it('has a full set of cards: every rarity', () => {
    const own = CARD_LIST.filter((c) => c.cls === 'rogue' && !c.starterOnly);
    for (const rarity of ['common', 'rare', 'epic', 'legendary'] as const)
      expect(
        own.some((c) => c.rarity === rarity),
        rarity,
      ).toBe(true);
  });
});

describe('cards named in a text', () => {
  it('wear the ink of their class: a hero its own, the rest by class', () => {
    const text = (id: string): string => cardText({ uid: 1, id, up: false });
    // A curse in the text (the Office Christmas Party's Gossip) and a hero's card (the Customer Always Right's Pain in the Neck is neutral).
    expect(text('officeChristmasParty')).toContain('data-cls="curse"');
    expect(text('customerAlwaysRight')).toContain('data-cls="neutral"');
    // Every named card: its class on the link, and a hero's class brings the hero's ink.
    for (const c of CARD_LIST) {
      for (const m of en[`card.${c.id}.desc`].matchAll(/\[@(\w+)\]/g)) {
        const html = text(c.id);
        expect(html, `${c.id} names ${m[1]}`).toContain(`data-card="${m[1]}" data-cls="${CARDS[m[1]].cls}"`);
        if (HERO_LIST.some((hd) => hd.id === CARDS[m[1]].cls)) expect(html, `${c.id} names ${m[1]}`).toContain('--ref-ink');
      }
    }
  });
});
