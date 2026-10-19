import { describe, expect, it } from 'vitest';
import { ENEMIES } from '../../src/data/enemies';
import { EVENT_LIST } from '../../src/data/events';
import { HEROES } from '../../src/data/heroes';
import { CREATURES } from '../../src/ui/art/creatures';
import en from '../../src/i18n/en';
import {
  applyFx,
  choicePossible,
  eligibleEvents,
  eventDone,
  finishEvent,
  fxPossible,
  hasStory,
  needsPick,
  rollEvent,
  rollResult,
} from '../../src/game/events';
import { advance, newRun, rollRelics, type RunState } from '../../src/game/run';
import { setup } from './helpers';
import { MAIN_ACTS } from '../../src/data/acts';

/** A run standing on an event room of the given act. */
function atEvent(act: number, seed = 5): RunState {
  const run = newRun('warrior', seed, [], [], MAIN_ACTS + 1);
  run.current = run.nodes.find((n) => n.act === act && n.type === 'event')!.id;
  return run;
}

describe('events', () => {
  it("are told by an enemy that has a picture (or by the cooler), and a hero's scene by a real hero", () => {
    for (const e of EVENT_LIST) {
      if (e.speaker) expect(CREATURES[ENEMIES[e.speaker]?.art], `${e.id}: ${e.speaker}`).toBeTruthy();
      if (e.hero) expect(HEROES[e.hero], e.id).toBeTruthy();
    }
  });

  it('have a title, a scene and every choice and result written (the other languages are checked against these keys)', () => {
    for (const e of EVENT_LIST) {
      expect(en, `${e.id}.title`).toHaveProperty(`event.${e.id}.title`);
      expect(en, `${e.id}.text`).toHaveProperty(`event.${e.id}.text`);
      expect(e.choices.length).toBeGreaterThanOrEqual(2);
      for (const c of e.choices) {
        expect(en, `${e.id}.${c.id}`).toHaveProperty(`event.${e.id}.${c.id}`);
        for (let i = 0; i < c.results.length; i++) expect(en, `${e.id}.${c.id}.${i}`).toHaveProperty(`event.${e.id}.${c.id}.${i}`);
      }
    }
  });

  it('are dealt on every dealt act, one per lane, and each act has some to tell', () => {
    for (let seed = 2; seed < 20; seed++) {
      const run = newRun('warrior', seed, [], [], MAIN_ACTS + 1);
      for (let act = 1; act <= MAIN_ACTS + 1; act++) {
        expect(run.nodes.filter((n) => n.act === act && n.type === 'event')).toHaveLength(2);
        expect(eligibleEvents({ ...atEvent(act, seed) }).length).toBeGreaterThan(1);
      }
    }
  });

  it('only come once per run, and a story chapter needs the one before it', () => {
    const run = atEvent(2);
    expect(eligibleEvents(run).map((e) => e.id)).not.toContain('janitorKey');
    applyFx(run, { kind: 'flag', id: 'janitorFriend' });
    expect(hasStory(run, 'janitorFriend')).toBe(true);
    // The follow-up is far likelier than anything else.
    expect(rollEvent(run).id).toBe('janitorKey');
    finishEvent(run, 'janitorKey');
    expect(eventDone(run, 'janitorKey')).toBe(true);
    expect(eligibleEvents(run).map((e) => e.id)).not.toContain('janitorKey');
  });

  it('never kill the hero and refuse a price the run cannot pay', () => {
    const run = atEvent(1);
    run.hp = 4;
    expect(fxPossible(run, { kind: 'hp', n: -6 })).toBe(false);
    expect(applyFx(run, { kind: 'hp', n: -6 }).hp).toBe(-3);
    expect(run.hp).toBe(1);
    run.money = 10;
    expect(fxPossible(run, { kind: 'pay', n: -30 })).toBe(false);
    const wallet = EVENT_LIST.find((e) => e.id === 'review')!;
    run.hp = 5;
    expect(choicePossible(run, wallet.choices.find((c) => c.id === 'argue')!)).toBe(false);
  });

  it('apply their effects to the run', () => {
    const run = atEvent(1);
    run.hp = 20;
    const maxHp = run.maxHp;
    applyFx(run, { kind: 'heal', pct: 0.5 });
    expect(run.hp).toBe(Math.min(maxHp, 20 + Math.round(maxHp * 0.5)));
    applyFx(run, { kind: 'maxHp', n: 5 });
    expect(run.maxHp).toBe(maxHp + 5);
    const money = run.money;
    applyFx(run, { kind: 'pay', n: 50 });
    expect(run.money).toBe(money + 50);
    const crystals = run.crystals;
    applyFx(run, { kind: 'crystal' });
    expect(run.crystals).toBe(crystals + 1);
    const deck = run.deck.length;
    expect(applyFx(run, { kind: 'card', rarity: 'rare' }).card).toBeDefined();
    expect(run.deck).toHaveLength(deck + 1);
    const done = applyFx(run, { kind: 'relic' });
    expect(done.relic && run.relics).toContain(done.relic);
    expect(applyFx(run, { kind: 'upgradeRandom' }).card?.up).toBe(true);
  });

  it("keep each hero's own scene for that hero", () => {
    const warrior = atEvent(1);
    expect(eligibleEvents(warrior).map((e) => e.id)).toContain('armClaim');
    expect(eligibleEvents(warrior).map((e) => e.id)).not.toContain('staplerHeist');
    const rogue = newRun('rogue', 5, [], [], MAIN_ACTS + 1);
    rogue.current = rogue.nodes.find((n) => n.act === 1 && n.type === 'event')!.id;
    expect(eligibleEvents(rogue).map((e) => e.id)).toContain('staplerHeist');
    expect(eligibleEvents(rogue).map((e) => e.id)).not.toContain('armClaim');
  });

  it("roll a gamble from the run's own rng, so a reload deals the same room", () => {
    const roll = (): string => {
      const run = atEvent(1, 9);
      const event = rollEvent(run);
      return `${event.id}:${event.choices.map((c) => rollResult(run, c).w).join()}`;
    };
    expect(roll()).toBe(roll());
  });

  it("give a story's stationery once, and never from the Lost & Found", () => {
    const run = atEvent(3);
    expect(fxPossible(run, { kind: 'relicId', id: 'masterKeys' })).toBe(true);
    expect(applyFx(run, { kind: 'relicId', id: 'masterKeys' }).relic).toBe('masterKeys');
    expect(run.relics).toContain('masterKeys');
    expect(fxPossible(run, { kind: 'relicId', id: 'masterKeys' })).toBe(false);
    for (let i = 0; i < 40; i++) expect(rollRelics(run, 3)).not.toContain('emeritusLanyard');
    const fight = setup({ relics: ['masterKeys'] });
    expect(fight.stacks('hero', 'lostBadge')).toBe(2);
  });

  it('name a pick of the hand only for upgrades and shreds', () => {
    expect(needsPick({ kind: 'upgrade' })).toBe(true);
    expect(needsPick({ kind: 'shred' })).toBe(true);
    expect(needsPick({ kind: 'upgradeRandom' })).toBe(false);
  });

  it('are reached by walking the map', () => {
    const run = newRun('warrior', 7, [], [], MAIN_ACTS);
    let seen = 0;
    while (advance(run)) if (run.nodes[run.current].type === 'event') seen++;
    expect(seen).toBeGreaterThan(0);
  });
});
