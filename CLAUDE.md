# Punchcard — technical guide

Real-time conveyor-belt deckbuilder for mobile browsers (portrait): a fantasy adventure run as a factory job, with a bit
of social satire. [README.md](README.md) is the owner's feature overview (Italian, no numbers: balancing never touches it).
This file holds the rules and the map of the code: read it before changing anything.
[docs/MECHANICS.md](docs/MECHANICS.md) says how each mechanic fits together across files: read the section of the mechanic you touch.
Field-by-field details live in the doc comments of `src/game/types.ts` and of the modules: don't copy them here.

## Working agreement

- Reply to the owner in **Italian**. Game text is **English** (i18n-ready).
- One task, one commit (git history is the task log). Small tweaks can share a commit. Stage your own files by path: the owner's unrelated edits in the working tree (balancing, notes, `TASKS.md`) are theirs, never `git add -A` unless they ask.
- Style: **riso pop inks + pixel art, a bit dark/scary**. NO emoji or Unicode symbols as icons (pixel icons only). Industrial/robotic/steampunk/chill/strange vibes change act by act.
- Tone: a run is a **workday**, each act a **shift**. Cards, enemies, moves, curses and UI words use workplace names, media or pop or history or political references; satire hits management and coworkers alike. Heroes stay fantasy with a light job touch. Statuses and keywords keep plain game names (Poison, Block, Rush…).
- Before handing over: `npm run check` and `npm run e2e` pass. Only for important UI changes, look at the screens you touched with one Playwright screenshot at 390×844 (375×620 only if the layout is tight), taken once at the end. **Delete every screenshot right after looking at it** (scratchpad ones too): no image is left around, ever.
- Balance: one quick `npm run sim` pass is enough while design moves.
- Bump `version` in `package.json` after every big batch (shown in the home screen's Settings only, with the build time, `__BUILD_TIME__`).
- Keep the docs true: fix any line a change makes stale, in the same commit.
- The shell is macOS (BSD tools, zsh): never `sed -i` or other GNU-only flags. Edit files with the Edit tool (or a short Python script), and check that an edit really landed before committing.

## Writing code

### Minimal

- Do what the task asks: no speculative options, flags, abstractions or hooks without a caller.
- **Rule of two.** One use: write it inline. A second use: share it (a helper, a common interface). A generic field or hook on a shared type (`StatusDef`, `EnemyDef`, `CardDef`, `Combat`) needs a second user, or one already planned. Copy-pasting a whole module to make a sibling is the same mistake as a field nobody else will use.
- Reuse first: `h`, `$`, `setText`/`setHtml`/`toggle`, `onPress`/`onTapOrHold`, `retrigger` (`ui/dom.ts`), `roomOption`/`closeRoom`/`roomScene` (`ui/components/room.ts`), `statusIcon`, `Rng`, `Emitter`, `load`/`store`, existing icons, sfx, modals, CSS tokens.
- No new dependencies without asking. No framework, state library or CSS preprocessor.
- Delete what you replace (dead code, CSS, i18n keys, icons, tests) in the same commit.
- Match the surrounding code: naming, comment density (short `/** */` on non-obvious things; comments say *why*).

### Correct

- Engine (`game/`, `data/`): only `combat.rng`/`Rng` (never `Math.random`) and simulated `dt` (never `Date.now`, timers) so seeds replay and the sim stays valid.
- The UI reads `Combat` state and calls its public actions; it never mutates fighters, piles or statuses. Card/enemy effects go through `Combat` helpers (`hit`, `gainBlock`, `applyStatus`, `addTempCard`…) so events and previews stay in sync.
- No `any`, no unchecked casts of untyped data, `!` only for DOM elements the template guarantees. Widen union types (`Keyword`, `IntentType`, `TaskId`…) rather than passing loose strings; a `switch` or lookup over a union covers every member (no `else` that means "everything else").
- A screen undoes in `leave()` what `enter()` did: listeners, emitter subscriptions, timers, temporary music.
- **Save data is untrusted.** `loadRun` (`run.ts`), `settings.ts` and `meta.ts` validate every field on load and drop or reset what is wrong. Changing a saved shape (or adding an act) → bump `SAVE_VERSION` (`run.ts`): a run saved by another version is simply dropped, never migrated (the meta progress is kept and validated field by field).
- Ids follow English names. Renaming = rename the id everywhere (no alias table: old saves are not kept alive).
- Test what you change: engine rule → `tests/combat/` (the file of its area); data shape → `content.test.ts`; flow/screen → `smoke.spec.ts`.

### Future-proof

- Adding a card, enemy, hero, status or relic touches data, i18n and art only. If it needs `if (id === …)` in engine or UI, add a generic field or hook (rule of two above). Statuses already work this way: effects are fields and hooks on `StatusDef` (see its doc comments), and `combat.ts` never names a status for a new effect.
- A mechanic only one enemy uses (a chore, a phase change, a belt trick) is a self-contained module registered by data: pure state in `game/<name>.ts`, its window in `ui/combat/`, a `TaskId`-like union and a record that maps it. `Combat` is the glue and stays free of that mechanic's details; when a second mechanic has the same shape, they share one interface before a third arrives.
- No hard-coded hero/enemy ids in UI; lists and icons come from data maps (`HEROES`, `ENEMIES`, `CARDS`, `STATUSES`, `ABILITY_ICON`). Tunable numbers live in `data/config.ts` or the records, never inline in UI or engine (named constants for purely visual steps are fine).
- Every player-facing string goes through `t()`; use `{placeholders}` and plurals, never English word order.
- Layout survives phones from 375×620 up and longer text: no fixed text widths, no positions that depend on string length.

## Stack and commands

Vite + TypeScript (strict), plain DOM through `h()`, CSS, one canvas for particles. Vitest (unit, content, balance sim), Playwright (mobile viewport, touch), Biome (width 150, single quotes). Fonts: `@fontsource` (Silkscreen, Jersey 10, Chakra Petch). Audio is WebAudio only. Static build, `localStorage` (prefix `cardstone+:`: keep it).

```bash
npm run dev      # dev server on the LAN
npm run check    # tsc + biome + vitest (before every commit)
npm run e2e      # Playwright smoke tests (own server on :5174)
npm run sim      # balance bot win rates
npm run stats    # static balance numbers from the data (no bot): writes BALANCE.md (git-ignored, not kept in the repo)
npm run build    # typecheck + production build
```

Deploy: a push to `master` publishes to GitHub Pages (`.github/workflows/pages.yml`).

## Architecture

```text
src/
  core/        rng (seeded), emitter, i18n (typed keys), save (safe localStorage), util
  i18n/        en.ts (every player-facing string, the source), it.ts / es.ts / zh.ts (`Record<EnKey, string>`, same placeholders)
  data/        config (all tuning), acts, statuses, heroes, enemies, perks, hexes, relics, modifiers, coffee (the Coffee Machine's drinks and coins), values, cards/<class>.ts
  game/        combat (engine), chore (the shared shape of a chore) with coffee and shells, run (map graph, rewards, save), meta (discoveries, unlocks, records, act stamps), settings, types
  ui/          app (screens, modals), dom
    art/       icons (64×64), creatures (200×200), relics (200×200 stationery sprites), rooms (200×200 picture of each room, and the props of the contract screen and the studio mark: `PROP_SPRITES`), actArt (the skyline behind each act's map title, and the animated scene of its intro), riso (pixel renderer)
    combat/    view, hud, cardLayer, mop, crank, taskFrame (the window every chore shares), coffeeWindow, shellWindow, combatFx, combatScreen
    components/ cardView, cardShow, coach, modals, memos, debugMenu, room, moveText, heroSheet, shareSlip, decor, reviewModal, runDetail
    fx/        particles, floating text, shake, haptics
    screens/   title, studio, heroSelect, journey, reward, rest, promotion, copyRoom, tailor, lostFound, vending, crossTraining, end, compendium
  feedback/    `firebase.ts`: the only file that knows Firebase (reviews, crash reports)
  analytics/   anonymous play counters: `index.ts` (what is counted and when), `goatcounter.ts` (the only file that knows the service)
  audio/       sfx (synth), music (sequencer + tracks)
  styles/      index.css imports partials in order; responsive.css stays last
tests/         combat/ (engine tests by area), content, balance.sim (+ bot), balance.stats, e2e/
docs/          MECHANICS.md
music.html    soundtrack player (second page of the build: /music.html)
dev/           art.html, og.html, map-editor.html (dev server only)
```

- **The engine is pure and deterministic.** `Combat` never touches the DOM: fixed 1/60 s ticks from a seed, typed `CombatEvent`s out. The UI subscribes (`combatFx.ts`) and renders state each frame (`hud.ts`, `cardLayer.ts`).
- **Content is data.** Cards, enemies, heroes, statuses are declarative records with small functions; `HeroHooks` and `RelicHooks` extend behaviour. Card numbers live once in `vals`/`upVals`; face, text, previews and logic all read them.
- **A run is a graph** of rooms drawn as an office floor plan, per act: a shared opening, two lanes, the boss. Details, scripted acts, rewards: `docs/MECHANICS.md`.
- **Rendering is diff-based**: `setText`/`setHtml`/`toggle` write only on change; status chips rebuild only when the set changes.

## Adding content: checklists

- **Card** (`data/cards/<class>.ts`): record + `card.<id>.name`/`.desc` in every language + its own art (rule icons are shared only within one concept). `face` grammar: `{kind:i}` icon + value · `{kind}` icon · `{?kind}` condition ("if", in brackets) · `{*kind}` trigger ("every time", a loop icon) · `{i}` bare value · `|` new line; kinds in `GLYPHS` (`cardView.ts`). `desc`: `{i}` values, `[kw]` keywords (need `kw.<kw>` and `kw.<kw>.d`). Keywords that change the engine are in `Keyword` (`types.ts`); glossary-only ones just need `kw.*` strings. Special mechanics (`ride`, `onOverflow`, `tip`, `sweep`, `costDrop`, `inSleeve`, `span`/`tall`/`lockRow`, `large`, `pack`…) are documented on `CardDef`.
  - A card's `type` is the colour of its background: attack pink, defense blue, skill yellow, power grey, curse green (`--cat-*`, `data-type`). There are no other types: rules name a type ("every attack") and the player sees it on the card.
  - Cost, keywords and values of a copy always come from `cardCostOf`/`cardKeywordsOf`/`cardValsOf`; set `dmg: []` only for raw damage that ignores modifiers.
  - Rarities: common, rare, epic, legendary (`special` only for cards a fight generates). Basic cards of the starter decks are common with `starterOnly` (never a reward, a vending drop or a cross-training offer).
- **Enemy** (`enemies.ts`): `EnemyDef` + a sprite in `creatures.ts` (with `onHalf`: also `<id>Angry`) + `enemy.<id>.name`, `move.<id>` per move, `enemy.<id>.half`; a move with a `task` also needs `enemy.<id>.order`/`.calm`. Fields are documented on the type.
- **Hero** (`heroes.ts`): `HeroDef`, a card file, a sprite, `hero.<id>.*` strings, `ABILITY_ICON`/`PASSIVE_ICON` (`ui/combat/view.ts`), `ink`.
- **Status** (`statuses.ts`): `StatusDef` with its required `tone` + `status.<id>` and `.d` (`{v}` = amount); `selfName`/`.self` when the hero's side reads differently.
- **Relic** (`relics.ts`): `RelicDef` + a sprite in `art/relics.ts` + `relic.<id>.name`/`.d` (`{n}`); a non-instant trigger needs `progress` or `armed`.
- **Room**, **act**, **memo**: see `docs/MECHANICS.md`; a new act also needs a block in `acts.css`, an `actArt` scene and a door into its fights (below, CSS).
- Tune with `CONFIG.enemyHp`/`enemyDmg` (global), `floorHp`/`floorDmg` (per floor); elites and bosses climb by act. `npm run stats` shows the numbers.

## i18n

`t(key)` is typed: literal ids must exist in `en.ts`. Runtime-built keys use known prefixes (`card.`, `enemy.`, `move.`, `status.`, `kw.`, `hero.`…), covered by the content test. Plurals: `{n|one|other}`. Languages: `en` (default), `it`, `es` and `zh` (Simplified Chinese: no plural forms, `{n|a|a}` repeats one; its text falls back on the system CJK font, `--font-cjk`), picked in Settings (`settings.locale`, reloads the page) or on the language screen of a first launch (`settings.localeChosen`). A new string goes in **all** the language files (a test checks same keys and placeholders: `{n}`, `{$name}`, `[kw]`); a new language: copy `en.ts`, register in `core/i18n.ts`. Italian keeps game words translated (Blocco, Veleno, Forza…) and the workplace-satire tone; it need not be literal and may keep the international term.

**Never type a game number in a string.** A number rules text quotes (a duration, a percentage, a threshold) goes in as `{$name}`, read from `VALUES` in `data/values.ts`, which takes it from the constant, status or record that makes the rule work (export the constant, don't copy it). Card values stay `{0}`/`{1}`, relic/perk numbers `{n}`. A test checks every `{$name}` has a value and every value is used.

## UI and interaction

- Screens: `show(screen)`, a screen is `{ el, enter?, leave?, frame? }`. Modals: `openModal`, `openInfo`, `openCardDetail`, `openDeck`.
- Tap = act, **hold = inspect** (`onPress`, `onTapOrHold`, `CONFIG.longPressMs`); inspecting pauses the fight (`view.inspect`). Tap targets ≥ 44 px. Modals close on a full tap on the backdrop, never on pointerdown.
- Desktop: above 560 px wide the column gets a poster frame (`shell.css`); hover feedback only under `(hover: hover) and (pointer: fine)`. Mouse: right click on a card inspects it. Keys in a fight (`onKey`, `combatScreen.ts`): Space/P/Esc pause (Space/P also resume), Space/Enter start, A ability, D deck, 1-9 sleeve slot; open windows keep their own keys (Esc closes them).
- An uncaught error opens the *Machine jam* window (`catchCrashes` in `main.ts`); catch expected rejections yourself.
- Debug menus show only with the Settings switch `debugMenus` (hidden until the home screen's version line is tapped `CONFIG.debugTaps` times); they are temporary.

## CSS

- Partials in cascade order via `styles/index.css`; **`responsive.css` stays last**. Shared decor in `decor.css`.
- Tokens in `tokens.css`, act themes in `acts.css` (inks `--p --b --y --k`, `--paper`, night `--bg --bg2 --void`, brass/paper helpers). Use a token, not a raw hex: a test fails on any colour written outside `tokens.css`/`acts.css` (scripts read tokens with `cssColor`; the pixel renderer's inks in `art/riso.ts` are checked against them). Paper panels: `--line` borders, hard `--off` shadows.
- **One source for anything two places must agree on.** Durations script waits on are tokens (`--dur-*`, read with `cssMs`); layers above the screens are `--z-*`; a hero's ink is `HeroDef.ink` and a status's look and particles are `StatusDef.look`/`burst` (no hero or status ids in CSS or UI code); numbers in rules text are `{$name}` values.
- Every act has a colour theme (`styles/acts.css`): the night tokens (`--bg`, `--bg2`, `--bg-dot`, `--night-dot`, the belt stream `--belt`) and the map's (`--map-*`) are re-set under `[data-act='N']`. A screen opts in with `data-act`: the map and the fight set it themselves (the fight by its enemy's act), rooms and rewards get it from `inAct` in `main.ts`; a new act needs its block there, an `actArt` scene and a door into its fights (`ActDef.door` sound, `--door-*` colours in its block, a `[data-act]` leaf in `combat-fx.css`).
- Fonts: `--font-display` (Silkscreen) for title words only; numbers use `--font-ui` (Jersey 10); long text `--font`.
- Motion is stepped (`steps(n)`); modals are the exception. Respect `reduce-motion`. Shared keyframes live once.
- `.card` sets its own `--cw`; resize by setting `--cw` on the card selector. Never let the combat layout change height mid-fight. Keep CSS to what Safari 16 supports (no `color-mix`).

## Pixel art and audio

Icons (`ICONS`) and creatures (`CREATURES`) are SVG written for the ink palette and rasterised at boot by `art/riso.ts`; `icon(id)` / `creature(id)` / `relicArt(id)` return the pixel versions. An icon with `wide: true` is drawn on a 128×64 grid (`.pico.wide`, 2em wide). Audio: `sfx(id)`, `playMusic(track)`, `playTemporaryMusic`/`endTemporaryMusic`; tracks are data in `music.ts`.

## Testing

- `tests/combat/`: engine rules, one file per area (`engine` rules, statuses and belt; `enemies` and their rules; `chores`; `cards`; `rogue`; `run` maps, rewards and saves; `relics`), shared fight setup in `helpers.ts`; add one test per mechanic to the file of its area. `content.test.ts`: data integrity. `balance.sim.test.ts` + `bot.ts`: bot win rates, relative only (the bot must be able to do every chore a fight asks). `balance.stats.test.ts`: per-mana card output and enemy threat computed from the data (`npm run stats` writes a git-ignored `BALANCE.md`: generate it when you need the numbers, never commit it). `tests/e2e/smoke.spec.ts`: flows on a mobile viewport with real touch where it matters; `freshGame` unlocks every hero unless `locked`.
- Other browsers: `npx playwright test --browser=webkit` passes; Firefox needs a config without `isMobile`.
- Screenshot scripts go in the git-ignored `screenshots/`.

### Running tests without wasting time

- The full `npm run e2e` takes about 2 minutes (measured: 2.1 min, 66 tests, Playwright's default workers on a 14-core Mac; `--workers=2` took 6.7 min): run it **once**, at the very end, with the default workers (never lower them up front). It outlasts the shell tool's 2-minute default timeout: run it in the background (or with a longer `timeout`) and wait for its end. While working, loop on `npm run check` (about 10 s) and on the one related e2e test (`npx playwright test -g "<part of the title>"`).
- Read the result with `npx playwright test --reporter=list 2>&1 | grep -E "✘|failed|flaky|passed"`: a `tail` of the default output shows slow tests and misleading counts.
- A test that fails in the full run: run **that test alone** first. If it passes alone it is machine load (many workers, another Playwright or dev server running): close whatever else is running and rerun the full suite once with the default workers (fewer workers only make it slower), don't dig into the code and don't loop reruns. Never start two Playwright runs at once (one shared server on :5174).
- Before the first run after a rename or a removed field, `grep` for the old name in `src`, `tests` and `dev`: `tsc` already points at the stale tests, so fix them in the same pass instead of finding them one run at a time.
- A screenshot is a throw-away spec (in `tests/e2e/` if `screenshots/` is not covered by the config) that you **delete before committing** (`git status` must not list it). Pitfalls that cost reruns: never overwrite `c.enemy.move` with a partial move (the HUD throws and the Machine jam window sends the page back to the title); `addTempCard(…, 'belt')` drops the card to the discard pile when the belt has no room, so add the card you want to see first, on an empty belt (`c.belt.length = 0`), and wait before adding the next; when the picture looks wrong, listen to `pageerror` before guessing; clip the shot to the area you changed.
