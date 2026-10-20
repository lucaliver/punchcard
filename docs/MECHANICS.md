# Hyakki — mechanics reference

How each mechanic fits together across files. Field-by-field details live in the doc comments of `src/game/types.ts`; this says where
things happen. Keep it true: a change that makes a line stale fixes it in the same commit.

## The fight (`game/battle.ts`)

- **Geometry.** `COLS`×`ROWS` = 5×7 tiles (`types.ts`); a foe's `y` is a float in rows (tile `r` spans `r…r+1`), a spirit stands at `row + 0.5`.
  Spirits go on rows `PLACE_ROW` (2) and below; a foe whose `y` reaches `ROWS` leaks (`leak`). Rocks (`Terrain`) take no spirit; a shrine tile
  gives the spirit on it `CONFIG.shrineBoost` more (damage, speed, oil).
- **Clock.** `Battle.step(dt)` runs fixed `CONFIG.tick` steps (`tick`): oil, the hand, lane zones, spawns, auras, spirits, foes, then `reap`
  (deaths, splits, kill hooks). Only `rng` and `dt`: a seed replays. The UI never writes to it; it calls `play`, `useAbility`, `recall`.
- **Oil and the hand.** Oil regenerates at `CONFIG.oil.regen` + relics up to the keeper's `maxOil`. The hand has `handSize` slots; a played
  card's slot refills after `CONFIG.hand.drawDelay` (less with a Paper Fan) from the draw pile, the discard pile is shuffled back in when it
  runs out (`fill`). `vanish` cards leave the fight. `redeal` throws the hand away and draws a fresh one. Costs: `cardCost` (keeper passive
  `charmCut`/`firstFree`, relic `charmCut`).
- **Playing.** `check(slot, lane, row)` says whether a card can go there (`PlayCheck` reasons); `play` pays, files the card, then a spirit is
  `place`d (a twin of the same card on the tile is a **merge**: `level + 1` up to `CONFIG.maxLevel`, HP and damage `levelGrowth` per level,
  healed) or a charm's `Effect`s run through `applyEffects`. `recall` takes a spirit back for half its cost × level.
- **Spirits.** `SpiritDef` is declarative: `atk` (`melee` hits the foe in contact, `shot` the nearest in `range`, `lob` splashes, `pierce` and
  `pulse` hit every foe in the lane within range), `oil`, `heal`, `aura` (adjacent/lane/all; rate and damage), `thorns`, `sticky`, `revive`,
  `trap`, `lifespan`, `onDeath` (effects), `roam` (slides to a thicker lane: `Battle.roam`). Auras are recomputed every tick (`computeAuras`).
- **Foes.** `FoeDef` + `FoeAbility` (`leap`, `web`, `mend`, `hasten`, `swap`, `summon`, `freeze`, `split`, `rage`, `slam`, `volley`: one `case`
  each in `perform`/`moveFoe`). A foe walks until a spirit's tile is within `reach`, then fights it (`moveFoe`); fliers ignore spirits.
  Statuses: stun, slow (and lane zones), burn, mark (`vulnT`: `CONFIG.vulnerable` more damage), armor takes a flat amount off every hit.
- **Telegraphs.** `incoming()` lists the spawns inside `CONFIG.warn` seconds (the field draws a lantern with the foe's shape at the top of its
  lane); `telegraph` events precede a slam or a volley by a second.
- **Ending.** Dawn at `stage.duration` (remaining foes burn away, `dawn`), or earlier when every spawn has come and none is left
  (`won` with `early`); `lost` when the flame is gone. Relic hooks: `killOil`, `leakSpare`, `chime`, `lastBreath`, `abilityFast`, `dawnMend`.

## Nights (`game/waves.ts`)

`makeStage({ act, floor, kind, seed, gentle, moon })`: a budget (`CONFIG.stage.budget`: base + per floor + per night; elites ×1.25, bosses ×0.65)
is spent on foes of the night's pool (`FoeDef.acts`, `cost`), spread over the night with a gentle ramp and now and then a pair; an elite comes
at 42%; a boss at 7 s (Orochi: five heads, one per lane). Terrain is dealt from the same seed. `hpMul`/`eliteMul`/`speedMul` carry the night,
the floor and the moon phase. `BOSS_OF_ACT` (`data/foes.ts`) names each night's boss.

## The climb (`game/run.ts`, `game/meta.ts`)

- **Map.** `genMap(seed, act, first)`: `CONFIG.run.mapRows` rows of 2–3 rooms plus the boss; roads link neighbouring columns, every room is
  reachable, rooms are weighted (`ROOM_WEIGHTS`) with a market, a shrine and an elite guaranteed; the first row is all watches, the last a rest.
- **Run state.** `RunState` (saved by `saveRun` after every step, validated field by field by `loadRun`; a run of another `SAVE_VERSION` is
  dropped). Dice come from `rngFor(run, tag)`: the seed plus a saved counter, so a reload deals the same offers.
- **Rewards.** `offerReward`: mon (`payFor`: base by kind + flame left + early dawn + relics/keeper), three cards (`rollCards`: rarity from
  `CONFIG.run.odds`, the keeper's own cards 1.6× likelier, sometimes already upgraded), an elite's trinket, a boss's choice of three. The
  offer is saved (`run.reward`) so a reload shows the same one.
- **Rooms.** rest (heal or upgrade), shrine (remove or transform: `removeCard`, `transformCard`), treasure (one of three trinkets), market
  (`stockShop`: five cards, two trinkets, remove, hot tea; prices ×(1 + moon)). `ui/flow.ts` strings the screens together.
- **Moon phases** (`data/moons.ts`, `CONFIG.moons`): five cumulative rules on a run (`RunState.level`): foe HP, less flame, tougher elites
  and bosses, dearer market, faster parade. `meta.moon` is the highest phase unlocked (a win at the top phase opens the next).
- **Keepers** (`data/keepers.ts`): deck, flame, oil, hand, one passive (`KeeperPassive`) and one ability (`Effect`s on a cooldown). `unlock`
  says what opens each one (`meta.openBy`: the first boss, the second boss, a won climb).

## Screens and drawing

- `ui/app.ts`: `show(screen)` swaps screens behind sliding shoji doors; `openModal`, `confirmModal`, `toast`. A screen is `{ el, enter?, leave?, frame? }`
  and undoes in `leave()` what `enter()` did.
- **The field** (`ui/battle/field.ts`) is one canvas: the backdrop is painted once per size (`backdrop.ts`, themed per night), sprites come from
  `ui/art/sprites.ts` (SVG strings rasterised by the browser), effects from `fx.ts`; everything is driven by the engine's events. The battle
  screen (`battleScreen.ts`) owns input (drag a card onto a tile, tap to arm, hold to inspect), the gauges and the hand.
- **Art** is code: `ui/art/kit.ts` (`solid` lights a shape, `eye`, `p`, `ell`…), one file per family (`foes`, `spirits`, `items`, `keepers`,
  `icons`), all registered in `ui/art/index.ts`; `dev/art.html?set=foes` shows a set. Colours are the kit's `C` and the stylesheet's tokens.
- **Rules text** is never written by hand: `ui/components/cardText.ts` builds faces (chips) and sentences from the data; `i18n/` only has
  names, flavour and fixed phrases. `**word**` marks a keyword.

## Sound (`audio/`)

`sfx.ts` synthesises every effect on demand (`pluck`, `taiko`, `bell`, `block`, noise); `music.ts` generates a score per track from a scale, a
progression and which layers play (`TRACKS`), scheduled a quarter second ahead; `setIntensity` pushes the drums.

## Tests

`tests/battle.test.ts` (engine rules, one per mechanic), `run.test.ts` (map, rewards, rooms, moons), `content.test.ts` (data integrity,
strings in both languages, art for every id), `balance.sim.test.ts`/`balance.runs.test.ts` (bots; `RUNS=40` for more), `cards.*.test.ts`
(reports), `e2e/smoke.spec.ts` (screens on a phone viewport, a whole climb).
