# Game development instructions

These instructions apply to this vending-game checkout.

- Read `DEVELOPMENT.md` and `README.md` before changing the game. The user explicitly requested continuous development notes.
- Update `DEVELOPMENT.md` for every game change: actual implementation, design decisions, validation evidence, limitations and remaining priorities. Keep unfinished items visible.
- Do not describe estimated NPC sales as a fully shared customer or inventory simulation. Do not expose nonfunctional difficulty options.
- Preserve Korean/Japanese entry, USD accounting, saved games, stable control nodes and a single simulation clock.
- Edit `src` files, then build with `python build.py`; `dist/index.html` is generated.
- Run tests appropriate to the change. Do not claim browser playtesting or calibrated difficulty when only automated tests ran.
