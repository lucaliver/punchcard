# Act 4 (the weekend): work log

A running list of what the weekend overhaul added, one entry per commit (newest last). The mechanics themselves live in [MECHANICS.md](MECHANICS.md); this is the changelog of the batch.

Before: one enemy of its own (the Self-Checkout) dealt for every fight, elites and boss borrowed from act 3, a random map, nothing weekend-specific.

## Batch 1: five new jobs
- **Enemies (normal)**: Off-Leash Dog (haste, steals cards, a squirrel stuns him at half HP), Brunch Influencer (Photo Op), Leaf Blower Neighbour (Leaf Blower), Gym Bro (Swole, multi-hit sets), The Couch (huge Block that never fades, few HP).
- **Statuses**: *Photo Op* (a pose every 14 s: 3 s with no damage taken), *Leaf Blower* (the belt is blown back the other way every 20 s, red warning first), *Swole* (`cutsHits`, a flat cut off every hit).
- **Art**: five 200×200 sprites + the dog's distracted face (halfArt), icons `leafBlower` and `selfie`, sounds `gust` and `shutter`.
- **i18n**: all of it in en/it/es/zh; `tests/combat/weekend.test.ts` for the new rules.

## Batch 2: the first new chore
- **Barbecue chore** (`'grill'`): flip the burgers before the Barbecue Dad's big move lands. Raw / ready / burnt sides on a timer, three patties on the grate at once, a gauge with a marker per patty, a plate that fills. `game/grill.ts`, `ui/combat/grillWindow.ts`, `CONFIG.grill`, `Combat.grill`, rule text, bot support, tests.
- **Barbecue Dad** (normal): thorns (the hot grill bites), Lighter Fluid (burn), Another Cold One (heal), *Flip the Burgers* (chore).
- **Art**: `grillDad` sprite, icons `patty` and `grill`.
