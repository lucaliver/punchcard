# Hyakki — design notes

Alternative take on the repo's game (the original, *Punchcard*, lives on `master`). Everything is new: theme, mechanic, art, menus, sound.
The premise, the rules and the plan, so a later session can pick up where the last stopped.

## Premise

Every summer night the **Hyakki Yagyō**, the Night Parade of a Hundred Demons, marches down the mountain road. You are a **lantern keeper**:
you carry the last lantern up the mountain and must keep its flame alive until dawn, night after night, by calling friendly spirits and laying
charms along the road. The tone is folklore with a dry smile (a one-legged umbrella hops by; the tanuki wants a receipt), not gore.
Three nights: **the village road**, **the bamboo and the marsh**, **the shrine stairs**; each ends on a boss (Nurikabe, Yamata-no-Orochi, Nurarihyon).

## The fight (real time, lanes)

- A field of 5 lanes × 7 rows, seen from above. The parade walks in from the top; the lantern is at the bottom. A foe that reaches the bottom
  costs flame (HP) and is gone. Survive until **dawn** (a timer, 60–100 s) or clear every foe sooner (paid more).
- You play **cards** from a hand of 4 (the deck cycles; a played card's slot refills after a moment). Cards cost **oil**, which regenerates.
  - **Spirit** cards are set on a free tile of the lower five rows: blockers, shooters, lobbers, pulses, oil makers, auras, traps.
    Playing the same spirit onto its twin **merges** them (★1 → ★3), so duplicates are a plan, not a curse.
  - **Charm** cards are one-shot spells (aimed at a lane, a tile, or nowhere).
- **Telegraphed**: a lantern marker shows at the top of a lane ~2.6 s before a foe walks in; bosses and elites warn before big moves.
- Tiles: *ground*, *rock* (nothing can be set), *shrine* (a spirit there works 30% harder). Dealt per fight from the seed.
- The keeper has a **passive** and an **ability** on a cooldown.

## The run

A map of rooms per night (watch, elite watch, rest, market, shrine, treasure) ending on the boss. Win a watch: choose 1 of 3 cards (or skip for mon),
elites and bosses add a relic. Rest: heal or upgrade a card. Market: tanuki shop. Shrine: remove a card. Three keepers, unlocked by beating
the first two bosses. Save on every room.

## Look

*Night washi*: deep indigo night, warm lantern light that actually glows (the opposite of the old game's flat riso), paper cards with a red hanko
seal for the cost, thick sumi outlines with flat jewel colours on every creature. Fonts: Potta One (brush titles), Dela Gothic One (numbers),
Zen Maru Gothic (text) — vendored under `src/assets/fonts` (SIL OFL). Menus are paper screens that slide like shoji. The sky lightens toward dawn
during a fight.

## Sound

Procedural: koto/shamisen plucks, taiko, wooden blocks, wind; a pentatonic generative score per night (WebAudio only).

## Plan / status

1. [x] Engine (`game/battle.ts`), data (cards, foes, keepers, relics), waves, bot + sim.
2. [ ] Art system (sprites, backdrops, card faces, icons).
3. [ ] Battle screen (canvas field, hand with drag and drop, HUD, effects, sfx).
4. [ ] Run layer (map, rewards, rest, market, shrine, relics, saves, end).
5. [ ] Menus (title, keepers, settings, almanac, how to play).
6. [ ] Music, polish, Italian text, e2e tests, balance pass.
