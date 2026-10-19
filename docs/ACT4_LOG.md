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

## Batch 3: the dance floor, the wardrobe and three elites
- **Chore hook `lapses`**: a mistake the clock makes by itself (a patty left to burn, a call left unanswered) is fined like a wrong touch. The grill now uses it: a burnt patty costs once, binning it is free.
- **Dance floor chore** (`'slide'`): the Wedding DJ shouts calls, the hero answers on a four-button pad before each times out; "freeze" calls ask for nothing at all. He speeds up. `game/slide.ts`, `slideWindow.ts`, `CONFIG.slide`, `Combat.slide`.
- **Elites** (their own, no longer borrowed from act 3): *Mother-in-Law* (Clean Plate: heals for every card you let slip; Guilt Trip curses; Second Helping inflates card costs; clutches her chest at half), *Ribbon-Cutting Mayor* (No Accountability: dodges for 5 s; Press Conference clogs the belt; Filibuster stalls it; lobbyists arrive at half), *Wedding DJ* (Cha-Cha Slide chore; Do You Take Requests drains mana; doubles the tempo at half).
- **Normal**: *Flat-Pack Wardrobe* (Flat Pack: another panel of Block every 6 s; Assembly Required swaps your belt and sleeve for a bag of spare screws).
- **Curses**: Leftovers (weak when it slips off), Spare Parts (bulky clog), Press Conference (unplayable, fleeting).
- **Art**: five sprites + angry faces for the three elites, icons plate, allenKey, tupperware, screws, microphone, discoBall, a better grill.

## Batch 4: the boss
- **Monday** (boss, the game's last): one alarm clock in three phases, `mondayOne` / `mondayTwo` / `mondayThree`. Sunday night (slow belt; Sunday Scaries curses, Insomnia blackout), the snooze button (fast belt; Snooze Button heals, *Coffee Before Anything* is the Slaves CEO's coffee chore again, Rise and Grind crunches), nine o'clock (belt rush; *Clock In* is the Punch Clock's badge chore, Stand-Up Meeting clogs the belt with Quick Syncs, All Hands hits hard). +40 Block at each phase.
- **Curse**: Sunday Scaries (stops your belt when it slips off). **Icons**: alarmClock (also the boss's marker on the map), sundayNight.
- **Tests / tools**: the bot can now run the weekend (`BotOpts.acts`) and reports each fight (`RunOutcome.fights`); the weekend's enemies hold their own against it like act 3's do.

## Batch 5: the map and two rooms of its own
- **Scripted weekend map** (`ACT_SCRIPTS[4]`, `SCRIPTED_ACTS` now has act 4): the first time a hero reaches the weekend its map is hand-drawn. Saturday: groceries (Self-Checkout), the Gym Bro or the Corner Shop, the Leaf Blower Neighbour or the Brunch Influencer, a Break Room or a vending machine, then the Wedding DJ (Saturday night) or the Barbecue Dad. Sunday: the dog or the Raffle, the Couch or the Flat-Pack Wardrobe, the Mayor or the Mother-in-Law, then a rest or the Sunday Lunch, and Monday.
- **Sunday Lunch** (weekend room): three dishes, you may only have two. Lasagna, tiramisu, grandma's recipe. Sprite, icons, tests.
- **Corner Shop** (weekend room): scratch cards, the first free, the others paid in blood; jackpot, upgrades, a heal or nothing.
- Later weekend maps (not the first) are dealt like any act's, and always hold both rooms (`WEEKEND_SPECIALS`).
- Bot walks through both rooms; tests for the dealing, the dishes and the scratch cards.

## Batch 6: a place for every job
- **Stage scenes**: `EnemyDef.stage` picks the scene behind the enemy (`StageId`, `stageArt(act, place)`). The weekend no longer happens in one supermarket aisle: the park (Off-Leash Dog, Gym Bro), a café terrace with parasols and fairy lights (Brunch Influencer), the back garden with a hedge, fence and washing line (Grill Dad, Leaf Blower Neighbour), a living room with a flickering telly (The Couch), a dining room with a wall of framed relatives (Mother-in-Law), a wedding hall with light beams and a balloon arch (Wedding DJ), the town hall with bunting (Ribbon-Cutting Mayor) and Monday's bedroom in the small hours (Monday). The aisle stays for the Self-Checkout and the Flat-Pack Wardrobe.
