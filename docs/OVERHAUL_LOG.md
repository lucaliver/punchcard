# Overhaul log

Everything added in the "make it feel finished" pass (2026-10-20 onwards), one entry per commit, newest last.
The mechanics themselves live in [MECHANICS.md](MECHANICS.md); this is the changelog of the batch.

## Diagnosis
The game was already polished in look and sound, but poor in three places: **narrative** (satire in names and one-liners, but no scenes, no recurring people, no choices with a story), **variety between fights** (every room outside a fight was a menu with fixed options), and **connective tissue** (nothing between the map and the fight to say what the day *is*).

## Step 1: the Water Cooler (events)
- A new room type, `event`, one on each lane of every dealt act: a scene with a speaker (one of the game's own enemies, out of fight mode, or the cooler itself), a typed note read in the speaker's voice, and two or three choices that show their price tags (HP, pay, a stationery, a card, an upgrade...) before the pick; a gamble shows every outcome it can end in.
- 20 scenes in four languages. A story that runs through a whole day: the Night Janitor (kind in the morning, a key in the afternoon, the truth at night) and the New Hire's favour.
- New pixel art: the Water Cooler sprite and a map icon.
- The bot plays events; tests for the dealing, the rules and the texts.

## Step 2: the Intercom and the acts' taglines
- **The Intercom**: the building's voice over the map, a ceiling speaker and a typed line (`data/intercom.ts`, `intercom.<id>`). 35 lines in four languages: cheery in the morning, passive-aggressive in the afternoon, wrong at night, the office intruding on the weekend, plus lines that answer what the run is going through (just clocked in, low HP, full HP, the boss next door, after an inspection, after the Water Cooler, after a break, a fat pay packet). The same room always reads the same line; a tap on the speaker asks for another.
- Every shift now has a tagline under its name in its intro (*Welcome to the family.* / *Lunch has been cancelled for synergy.* / *Overtime is voluntary. Volunteer.*), not just the weekend.
- The typed-line effect is a shared component (`ui/components/typewriter.ts`).
- Narrative texts moved to `i18n/story/`.

## Step 3: epilogues
- The end screen now has a note under the verdict (`data/epilogue.ts`, `epilogue.*`): a line about the hero (eight, win and loss for each) and one about the story the run told, if any (the Night Janitor's truth, the New Hire's postcard, a key ring on the desk). 28 lines in four languages.
- The janitor's last chapter now sets a story flag, so the ending can answer it.

## Step 4: each hero's own scene
- Four events only one hero meets (`EventDef.hero`): the Warrior's arm claim, the Mage's password reset, the Necromancer's union meeting, the Rogue's stapler heist. Weighed above the common ones, so every run of a hero tells at least one scene about who they are. 24 scenes in all.

## Step 5: the rooms talk
- Each room's picture (Break Room, Promotion, Copy Room, Tailor, Lost & Found, Vending Machine, Restructuring, Sunday Lunch, Corner Shop) now says a line when it comes in and another when a choice is made, in the same speech bubble the enemies use (`quip.<room>.enter.<n>` / `.done.<n>`, 45 lines in four languages). The coffee machine counts your fifteen minutes; the vending machine takes blood.
- Dev hook `__game.room(type)` opens any room on the current run (for screenshots).

## Step 6: office conditions
- A share of ordinary fights (35%, never the first run's) come with **the day's twist**, told on a slip over the enemy's passives and in the map's room info: four perk days (Free Coffee Day, Casual Friday, Safety Week, Workers' Comp Wednesday) and four days of trouble that pay 35% more (Understaffed, Mandatory Overtime, Audit Week, Wellness Week). Built from statuses the engine already has, so no new rules in `Combat`; dealt from the run's seed, so nothing is saved.
- Tests for the dealing, the statuses and the pay.

## Step 7: the story reaches the first run, and more scenes
- **The hand-drawn maps have an event too** (act 1's floor 8, act 2's floor 4, act 3's floor 4, the weekend's floor 4: each one against another room, so it is a choice), so a new player meets the Water Cooler on the first pass of every act, and the teaching run's first scene is always the Night Janitor's spill.
- A follow-up chapter of a story the run began is now certain to be met (weight 1000), not just likely.
- 12 new scenes (36 in all): Fire Drill, Secret Santa, Leftover Fish, Lunch & Learn, The Reorg, Bonus Announcement, Dog Day, Salary Talk, Elevator Pitch, Anonymous Survey, Night Delivery, The Rooftop; and a third story, Intern #47, who remembers you at three in the morning.

## Step 8: Gossip, weekend scenes, a longer Intercom
- **The handbook's Gossip page** (`meta.scenes`, validated on load): every Water Cooler scene as a line, a shape and question marks until it has been met, then its speaker's face and title; a tap reads it again. A collection to fill that sends you back for another run.
- 5 weekend scenes (Barbecue invite, Laundry Day, the Gym Bro's free trial, a wedding's plus one, the Sunday call): 41 scenes in all.
- The Intercom grew to 52 lines (a few more for each act, and one for when a boss has fallen).
- The day's twist slip is `.today-slip` (it shared `.foe-traits` with the passives, so a test counting those flaked).

## Step 9: small things
- The portrait in the HUD of a scene pulls a face (wince, cheer, cast) as what you chose lands.
- The Intercom greets the people the run was kind to (the janitor, the New Hire, the intern).
- Version 2.70.0.
