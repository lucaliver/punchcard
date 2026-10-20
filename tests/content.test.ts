import { describe, expect, it } from 'vitest';
import { setLocale, t } from '../src/core/i18n';
import { CARDS, spiritOf } from '../src/data/cards';
import { CONFIG } from '../src/data/config';
import { FOES } from '../src/data/foes';
import { KEEPER_IDS, KEEPERS } from '../src/data/keepers';
import { RELICS } from '../src/data/relics';
import en from '../src/i18n/en';
import it_ from '../src/i18n/it';
import { cardLines, effectLine, foeLines } from '../src/ui/components/cardText';
import { ALL_ART } from '../src/ui/art';

const art = new Set(Object.values(ALL_ART).flatMap((g) => Object.keys(g)));
const placeholders = (s: string): string[] => [...s.matchAll(/\{(\w+)(?:\|[^}]*)?\}/g)].map((m) => m[1]).sort();

describe('strings', () => {
  it('Italian has the same keys and placeholders as English', () => {
    expect(Object.keys(it_).sort()).toEqual(Object.keys(en).sort());
    for (const k of Object.keys(en) as (keyof typeof en)[]) expect(placeholders(it_[k]), k).toEqual(placeholders(en[k]));
  });

  it('no string is empty, and no raw markup leaks', () => {
    for (const [k, v] of Object.entries(en)) {
      expect(v.trim().length, k).toBeGreaterThan(0);
      expect(v, k).not.toMatch(/[<>]/);
    }
  });

  it('every card, foe, relic and keeper has its words', () => {
    for (const id of Object.keys(CARDS)) {
      expect(en[`card.${id}.name` as keyof typeof en], id).toBeTruthy();
      expect(en[`card.${id}.flavor` as keyof typeof en], id).toBeTruthy();
    }
    for (const id of Object.keys(FOES)) {
      expect(en[`foe.${id}.name` as keyof typeof en], id).toBeTruthy();
      expect(en[`foe.${id}.lore` as keyof typeof en], id).toBeTruthy();
    }
    for (const id of Object.keys(RELICS)) {
      expect(en[`relic.${id}.name` as keyof typeof en], id).toBeTruthy();
      expect(en[`relic.${id}.d` as keyof typeof en], id).toBeTruthy();
    }
    for (const id of KEEPER_IDS)
      for (const k of ['name', 'title', 'blurb', 'passive', 'passive.d', 'ability'])
        expect(en[`keeper.${id}.${k}` as keyof typeof en], `${id} ${k}`).toBeTruthy();
  });
});

describe('art', () => {
  it('every card, foe, relic and keeper has a drawing', () => {
    for (const c of Object.values(CARDS)) {
      const id = c.kind === 'spirit' ? spiritOf({ uid: 0, id: c.id, up: false })?.art : c.art;
      expect(art.has(id ?? ''), `card ${c.id}`).toBe(true);
    }
    for (const f of Object.values(FOES)) expect(art.has(f.art), `foe ${f.id}`).toBe(true);
    for (const r of Object.values(RELICS)) expect(art.has(r.art), `relic ${r.id}`).toBe(true);
    for (const k of KEEPER_IDS) expect(art.has(k), `keeper ${k}`).toBe(true);
    for (const a of [
      'lantern',
      'nodeWatch',
      'nodeElite',
      'nodeBoss',
      'nodeRest',
      'nodeMarket',
      'nodeShrine',
      'nodeTreasure',
      'flame',
      'oil',
      'heart',
      'sword',
      'clock',
      'coin',
      'star',
      'stun',
      'slow',
      'burn',
      'web',
      'thorns',
      'gust',
      'cards',
      'bell',
      'dice',
      'henge',
      'leafDecoy',
    ])
      expect(art.has(a), a).toBe(true);
  });
});

describe('cards', () => {
  it('each card is a spirit or a charm with what that needs', () => {
    for (const c of Object.values(CARDS)) {
      expect(c.cost, c.id).toBeGreaterThanOrEqual(0);
      if (c.kind === 'spirit') {
        const sd = spiritOf({ uid: 0, id: c.id, up: false });
        expect(sd?.hp, c.id).toBeGreaterThan(0);
        const sdu = spiritOf({ uid: 0, id: c.id, up: true });
        expect(JSON.stringify(sdu), `${c.id} upgrade`).not.toBe(JSON.stringify(sd));
      } else {
        expect(c.fx, c.id).toBeDefined();
        expect(c.aim, c.id).toBeDefined();
        expect(JSON.stringify(c.fx?.(true)) !== JSON.stringify(c.fx?.(false)) || c.upCost !== undefined, `${c.id} upgrade`).toBe(true);
      }
    }
  });

  it('damage is always a whole number (every hit is rounded, so a face with 2.5 would lie)', () => {
    for (const c of Object.values(CARDS)) {
      for (const up of [false, true]) {
        const a = c.spirit?.(up).atk;
        if (a) expect(Number.isInteger(a.dmg), `${c.id} ${up ? 'up' : ''}`).toBe(true);
        for (const fx of c.fx?.(up) ?? []) if (fx.k === 'hit') expect(Number.isInteger(fx.dmg), `${c.id} ${up ? 'up' : ''}`).toBe(true);
      }
    }
  });

  it('their rules text can be built, in both languages', () => {
    for (const lang of ['en', 'it']) {
      setLocale(lang);
      for (const c of Object.values(CARDS))
        for (const up of [false, true])
          for (const line of cardLines({ uid: 0, id: c.id, up })) expect(line, `${lang} ${c.id}`).not.toMatch(/^(stat|fx|aim|rule|scope)\./);
    }
    setLocale('en');
  });

  it('every effect kind has a sentence', () => {
    for (const c of Object.values(CARDS)) for (const fx of c.fx?.(false) ?? []) expect(effectLine(fx), c.id).not.toMatch(/^fx\./);
  });

  it('the keepers’ starting decks are real and whole', () => {
    for (const id of KEEPER_IDS) {
      const k = KEEPERS[id];
      expect(k.deck.length).toBeGreaterThanOrEqual(CONFIG.run.minDeck);
      for (const c of k.deck) expect(CARDS[c], `${id} ${c}`).toBeDefined();
      expect(
        k.deck.some((c) => CARDS[c].kind === 'spirit' && CARDS[c].cost <= k.oil + 1),
        id,
      ).toBe(true);
    }
  });

  it('keepers’ own cards: ten each, and rarities are all represented across the game', () => {
    for (const id of KEEPER_IDS) expect(Object.values(CARDS).filter((c) => c.keeper === id).length).toBeGreaterThanOrEqual(10);
    const rarities = new Set(Object.values(CARDS).map((c) => c.rarity));
    for (const r of ['common', 'rare', 'epic', 'legend']) expect(rarities.has(r as 'common'), r).toBe(true);
  });
});

describe('foes', () => {
  it('abilities point at foes that exist, and every night has its company', () => {
    for (const f of Object.values(FOES)) {
      for (const a of f.abilities ?? []) if ('foe' in a) expect(FOES[a.foe], `${f.id} → ${a.foe}`).toBeDefined();
      expect(f.hp).toBeGreaterThan(0);
      expect(f.speed).toBeGreaterThan(0);
    }
    for (const act of [1, 2, 3]) {
      const tiers = new Set(
        Object.values(FOES)
          .filter((f) => f.acts.includes(act))
          .map((f) => f.tier),
      );
      for (const tier of ['normal', 'elite', 'boss']) expect(tiers.has(tier as 'normal'), `act ${act} ${tier}`).toBe(true);
    }
  });

  it('every foe can be described', () => {
    for (const lang of ['en', 'it']) {
      setLocale(lang);
      for (const f of Object.values(FOES)) for (const line of foeLines(f)) expect(line, f.id).not.toMatch(/^foe\./);
    }
    setLocale('en');
  });

  it('rules text names real words', () => {
    expect(t('foe.hp', { n: 3 })).toContain('3');
  });
});
