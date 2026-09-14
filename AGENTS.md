# Game development instructions

These instructions apply to this vending-game checkout.

- Read `DEVELOPMENT.md` and `README.md` before changing the game. The user explicitly requested continuous development notes.
- Update `DEVELOPMENT.md` for every game change: actual implementation, design decisions, validation evidence, limitations and remaining priorities. Keep unfinished items visible.
- Update the current status checkboxes, partial-completion table and next-task completion criteria directly; appending a change log alone is insufficient. Keep historical/user design records in `docs/DEVELOPMENT_HISTORY_2026-09-10.md` and do not treat their old status statements as current.
- Separate implemented scope, automated checks, actual browser/human play validation and deployed state. Link completion evidence and leave unsupported or partially implemented goals unchecked.
- Do not describe estimated NPC sales as a fully shared customer or inventory simulation. Do not expose nonfunctional difficulty options.
- Preserve Korean/Japanese entry, USD accounting, saved games, stable control nodes and a single simulation clock.
- Edit `src` files, then build with `python build.py`; `dist/index.html` is generated.
- Run tests appropriate to the change. Do not claim browser playtesting or calibrated difficulty when only automated tests ran.

## Multi-agent game development

- Before assigning or performing specialist game work, read `docs/QUALITY_ROLES.md` and the role's linked instructions in `game-agent.md/`. Those repository files are the canonical instructions, including on other computers.
- The tutorial/player-experience and balance/systems roles cover the entire game, from first launch through expansion, late game, victory, bankruptcy and continued play. A bounded task does not narrow that standing scope. Record missing ending design as a gap rather than inventing completion.
- For substantial cross-system development or whole-game reviews, assign independent bounded tasks to both roles when multi-agent tools are available. Give each role file ownership, questions and completion evidence. Routine small edits do not require delegation. If tools are unavailable, apply both review perspectives locally and say which checks were actually performed.
- Tutorial role reads `game-agent.md/game-designer.md`, `narrative-designer.md` and `level-designer.md` in that directory. Balance role reads `game-agent.md/economy-designer.md` and `game-designer.md`. Integration owner reads all four.
- Specialists report observations, reproducible evidence, proposed changes and remaining uncertainty separately. Integration owner resolves conflicts and owns final integration, commits and publication. Keep development directives out of the game UI.
