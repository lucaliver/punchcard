# Hyakki — technical guide (branch `alt/hyakki`)

An alternative game built on the same stack as *Punchcard* (master): a **real-time lane-defense deckbuilder** for mobile browsers (portrait),
themed on the Japanese Night Parade of a Hundred Demons. Read [docs/DESIGN.md](docs/DESIGN.md) first (premise, rules, look, plan).

## Working agreement

- Reply to the owner in **Italian**. Game text is **English** (`src/i18n/en.ts` is the source), with an Italian file kept in step.
- One task, one commit; stage your own files by path. Before handing over: `npm run check` (and `npm run e2e` once the flow exists).
- The shell is macOS (BSD tools, zsh): never `sed -i 's/a/b/'`, no GNU-only flags. Edit with the Edit tool or a short Python script.
- This branch lives in its own git worktree (`../cardstone-plus-hyakki`) so the owner's working tree on `master` stays untouched. Never push
  to `master` and never touch `beta`.
- Keep the docs true: fix any line a change makes stale in the same commit.

## Stack and commands

Vite + TypeScript (strict), plain DOM through `h()`, CSS, one canvas for the field. Vitest, Playwright (mobile viewport), Biome (width 150, single
quotes). No new npm dependencies; fonts are vendored files. `localStorage` prefix `hyakki:`.

```bash
npm run dev      # dev server on the LAN
npm run check    # tsc + biome + vitest
npm run sim      # balance bot win rates
npm run e2e      # Playwright smoke tests
```

## Code map

```text
src/
  core/    rng (seeded), emitter, i18n (typed keys, en + it), save, util
  game/    types, battle (the engine), waves (a night's parade from a seed), run, meta, settings
  data/    config (all tuning), cards, foes, keepers, relics
  ui/      app (screens, modals), dom, art/ (sprites, backdrops), battle/ (field canvas, hand, hud), screens/, components/
  audio/   sfx, music
  styles/  tokens.css first, responsive.css last
tests/     engine tests, content test, bot + sim, e2e/
```

## Rules of the engine

- `Battle` is pure and deterministic: only its `Rng` and the `dt` it is stepped with (never `Math.random`, `Date.now`, timers). The UI reads state
  and subscribes to `events`; it never mutates fighters. Effects of cards, abilities and spirits are data (`Effect`, `SpiritDef`, `FoeAbility`),
  never `if (id === …)` in the engine.
- Numbers live once, in the data or `data/config.ts`; faces, texts and logic all read them.
- Save data is untrusted: validate every field on load, drop what is wrong; bump the save version when a saved shape changes.
- Every player-facing string goes through `t()`; no emoji or Unicode symbols as icons.
