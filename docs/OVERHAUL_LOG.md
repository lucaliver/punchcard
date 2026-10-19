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
