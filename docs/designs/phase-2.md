# FF1 Foundation — Phase 2 Design Spec (First Adventure Slice)

Goal: Grow the Phase 1 prototype (single hero, random encounters, simple turn-based combat) into a cohesive “first adventure slice” that deepens combat, adds light progression and items, expands the overworld with NPC/dialog and warps, introduces save/load, basic sound effects, and optional touch controls — all using vanilla JS + Canvas and no external assets.

This document defines scope, player experience, system rules, data models, file plan, milestones, and acceptance criteria. It aligns with the current codebase and keeps changes incremental and achievable.


## 1) Player Experience Goals
- A short, replayable loop: explore a slightly larger map → trigger encounters → win battles → gain XP/levels → use a potion or equip a sword → talk to an NPC → warp to a small “field/town” → save → continue later.
- Battles feel more alive with multiple enemies, formations, basic enemy variety, and quick feedback (SFX, hit flashes, HP bars).
- Simple progression that matters: leveling gives noticeable stat bumps; a basic weapon or armor changes damage taken/dealt.
- No asset pipeline: visuals are primitive but readable; audio is generated beeps via WebAudio.


## 2) Scope and Priorities

Must (Phase 2 core):
1. Multiple enemies per battle (up to 3) with simple formations and names.
2. Enemy variety (3 types): Slime (baseline), Wolf (fast/evade), Bat (low HP, may flee/peck).
3. Player progression: XP, levels, stat growth, level-up popups.
4. Basic items: Potion (heal 20 HP) usable in battle; inventory management.
5. Basic equipment: Weapon (Sword +2 ATK), Armor (Cloth +1 DEF). One slot each.
6. Overworld expansion: 20×15 map, 1 warp (field ↔ town), 1 NPC with dialog window.
7. Save/Load (localStorage, single slot) with party state, map/position, inventory, equipment.
8. Sound effects (generated): cursor move, confirm, hit, miss, victory, escape.

Should (nice-to-have if time allows):
- Touch controls: D-pad + Confirm/Back overlay.
- Particle/spark effects on hit and level-up.
- Pause menu (Resume / Save / Load / Quit to Title) instead of hotkeys only.

Could (explicitly out-of-scope for Phase 2):
- Full party system, multiple classes, promotions.
- Complex magic/skills/status effects; shops/gold economy.
- Background music (can be deferred or added as simple tone loop if time permits).


## 3) Systems Design

### 3.1 Combat (Multi-Enemy + Formations)
- Formation: Up to 3 enemies at fixed layout slots (e.g., Left, Center, Right). Purely cosmetic for now; no row modifiers.
- Turn order: Keep existing Speed+d20 model (reuse current formulas). Each enemy acts.
- Targeting:
  - Player Attack: choose single enemy.
  - Defend: halves next damage (kept from Phase 1).
  - Run: same formula; escape ends battle.
  - Items: opens inventory, shows usable items; Potion heals the player; using consumes one.
- Rendering:
  - Show enemy names above slots.
  - Add simple HP bars for enemies (optional: only show after they’ve taken damage).
  - Floating text retained (damage/MISS/WIN/LOSE/ESCAPE).

Enemy types (data-driven):
- Slime: balanced stats; always Attack.
- Wolf: higher Speed/Evasion; rarely Defend.
- Bat: very low HP, low Accuracy; 20% chance to attempt Run (flee); otherwise Attack.

AI rules kept simple and table-driven (percent chances per action) to fit current code.


### 3.2 Progression (XP/Levels/Stats)
- Player has Level, XP, and derived stats that influence combat.
- XP thresholds: use a simple quadratic curve: Next Level XP = 20 × Level² (cumulative totals implicit). Tweakable via constants.
- On level-up:
  - +2 ATK, +1 DEF, +3 HP Max; fully heal to new max HP.
  - Show “Level Up!” popup with stat gains.
- Stats used in combat:
  - Attack Power = BaseATK + WeaponATK + Level bonus
  - Defense = BaseDEF + ArmorDEF
  - HP Max = BaseHP + Level bonus + item bonuses (if any)
- Display Level and XP (current/next) in HUD or pause menu.


### 3.3 Items and Inventory
- Item: Potion (heal 20 HP). Stack limit 9.
- Inventory: simple array of stackable items by id and count.
- UI: In battle, selecting Items opens a list; confirm uses item and closes submenu.
- Out-of-battle item usage may be added via pause menu (Should), otherwise only in battle for Phase 2.


### 3.4 Equipment
- Slots: Weapon (one), Armor (one).
- Starting gear: none; early chest/NPC grants Sword (+2 ATK) and Cloth (+1 DEF).
- Simple compare preview in Equipment menu (Should). If no menu, show temporary popup on equip.


### 3.5 Overworld Expansion
- Map: 20×15 tiles, mix of walkable, blocked, encounter zones (reuse types 0/1/2).
- Warps: one link between Field and Town maps.
- NPC: 1 character in town; interacting shows a dialog window with 2–3 lines.
- Interaction: Enter/Space to talk when facing the NPC; show window box with typewriter reveal (configurable speed).


### 3.6 Save/Load
- Storage: localStorage with single slot key (e.g., "ff1_save").
- Data saved:
  - Map id, player tile position, camera clamped automatically on load.
  - Player: Level, XP, HP current/max, BaseATK/DEF, equipment ids, inventory.
  - Encounter system’s current step threshold counter.
- UX: Minimal — hotkeys Save=S, Load=L (or via Pause menu if implemented). Show confirmation popups.
- Robustness: If no save exists, Load does nothing and shows a popup.


### 3.7 Sound Effects (WebAudio)
- Simple beep generator with adjustable frequency/duration/volume.
- Events → SFX mapping:
  - Cursor move (short blip), Confirm (slightly lower blip), Hit (short square wave), Miss (noise or detuned blip), Victory (two ascending tones), Escape (descending tone).
- Global volume constant; allow mute toggle via key M.


### 3.8 Touch Controls (Should)
- On-screen D-pad (Up/Left/Down/Right) and two buttons: A (Confirm), B (Back/Cancel or Defend).
- Toggle: auto-enable on touch-capable devices or via URL param (?touch=1).
- Input integration: set the same key state flags used by keyboard input.


## 4) Data Models (Design-Level)

Enemy (example fields):
- id, name, hpMax, atk, def, spd, acc, eva, xpYield
- ai: { attack: %, defend: %, run: % }

Formation:
- id, name, slots: [enemyId, enemyId, enemyId] (length ≤ 3)
- weight: relative encounter frequency

Item:
- id, name, type: "consumable" | "key", effect: { healHp: 20 }, maxStack

Equipment:
- id, name, slot: "weapon" | "armor", atkBonus, defBonus

Save payload:
- version, mapId, player: { x, y, level, xp, hp, hpMax, baseAtk, baseDef, weaponId, armorId }
- inventory: [{ itemId, count }]
- encounters: { stepsUntilCheck }

Note: Actual code will store minimal integers/ids where possible to keep saves small.


## 5) File Plan and Integration

New files:
- src/engine/audio.js — WebAudio beep generator and SFX registry.
- src/engine/ui/dialog.js — Windowed dialog box with typewriter effect.
- src/engine/ui/touch.js — Touch overlay (D-pad + A/B) that maps to input flags. (Should)
- src/game/enemies.js — Enemy defs and helpers (getEnemyById).
- src/game/formations.js — Formation tables and random selection by terrain.
- src/game/progression.js — XP thresholds, level-up logic, and stat growth.
- src/game/inventory.js — Inventory data, add/remove/use APIs.
- src/utils/storage.js — Save/load helpers (localStorage + JSON schema versioning).

Modified files:
- index.html — Add new scripts in dependency order (engine → utils → game data → game logic → main).
- src/game/constants.js — Add XP curve constants, SFX volumes, map sizes, inventory caps.
- src/game/encounters.js — Use formations; generate up to 3 enemies per battle.
- src/game/combat.js — Support multi-enemy targeting, enemy HP bars, Items command.
- src/game/player.js — Add interact check for NPCs (facing tile action); no change to movement feel.
- src/game/levels.js — Add 20×15 field map, town map, and warp triggers.
- src/game/main.js — Hook dialog system, save/load hotkeys or pause menu, HUD updates for Level/XP.
- src/engine/ui.js — Optional: minor additions for HP bar primitives if needed; otherwise keep dialog separate.

100-line rule:
- If combat.js or main.js approach 100 lines after feature additions, split:
  - combat/targets.js (selection + validation)
  - combat/ui.js (battle UI states/menus)
  - main/pause.js (pause menu + save/load)


## 6) Milestones and Acceptance Criteria

M1 — Multi-Enemy Battles + Enemies (Must)
- Implement enemies.js and formations.js; encounters spawn 1–3 enemies.
- Combat supports selecting an enemy target; each enemy takes turns.
- Acceptance: Win a battle vs. 3 enemies; damage numbers appear per enemy; victory popup shows combined XP.

M2 — Progression + Items + Equipment (Must)
- progression.js calculates level-ups and applies stat gains.
- inventory.js with Potion (heal 20) usable in battle via Items menu.
- Equipment modifies ATK/DEF; equipping reflected in damage taken/dealt.
- Acceptance: Level up from 1→2 with popup; use a Potion in-battle; equipping Sword changes damage by +2 ATK.

M3 — Overworld Expansion + NPC Dialog + Save/Load (Must)
- 20×15 field + town, warp trigger, one NPC with dialog window.
- storage.js saves and loads state (single slot) via S/L keys (or pause menu if implemented).
- Acceptance: Talk to NPC (dialog shows), warp between maps, save → reload page → load restores position and state.

M4 — SFX + Polish + Touch (Should)
- audio.js connected to key events (cursor/hit/miss/victory/escape) with volume control.
- Optional particles or hit flash; optional touch controls overlay.
- Acceptance: Audible feedback on key events; optional: tap controls move and confirm.


## 7) Testing Checklist
- Encounters: After N steps, sometimes 1, 2, or 3 enemies appear; terrain modifier still influences frequency.
- Combat: Targeting cycles through enemies; MISS and damage apply correctly per target; Defend halves next damage.
- Progression: XP accumulates; thresholds trigger level-up exactly once; derived stats recalc; HP fully restored.
- Items: Using Potion reduces inventory count and heals exact amount; can’t use at full HP (optional validation).
- Equipment: ATK/DEF bonuses applied in calculations and reflected in damage range.
- Overworld: Warps clamp camera; NPC dialog opens only when facing and close; dialog advances with Confirm.
- Save/Load: Load with no save shows message; loading restores map/pos/HP/XP/inventory/equipment.
- SFX: Each mapped event produces a distinct tone; mute toggles correctly.
- Touch (if implemented): D-pad moves; A confirms; B backs out of menus.


## 8) Performance and Technical Notes
- Target 60fps; avoid allocations during update/render (reuse arrays for enemies/particles).
- Only draw visible elements; enemy HP bars are simple rects.
- Keep data-driven content in separate small files; prefer ids over deep objects in hot paths.
- Ensure script load order in index.html: core → engine → utils → engine/ui/dialog → engine/ui/touch → game data (enemies/formations) → game systems (progression/inventory) → game logic (encounters/combat/player/main).


## 9) Risks and Mitigations
- Scope creep (party/classes/skills): explicitly deferred; Phase 2 sticks to single hero and simple items/equipment.
- UI complexity (battle submenus): keep Items minimal and flat; no nested categories.
- Save corruption: versioned schema with try/catch on parse; invalid data resets gracefully.
- Touch input devices variance: feature-detect touch; keep overlay minimal and optional.


## 10) Out-of-Scope (Future Phases)
- Party of four, class system, promotions, full magic list, shops/gold, complex status effects, music tracks.
- Larger world, dungeons, quests, cutscenes.


## 11) Quick Implementation Order (TL;DR)
1) enemies.js + formations.js → encounters.js integration.
2) combat.js: multi-target selection + enemy HP bars + victory XP award.
3) progression.js → level-ups; HUD shows Lvl/XP.
4) inventory.js and Items command (Potion); equipment handling.
5) levels.js: new maps + warp; ui/dialog.js + NPC.
6) storage.js + save/load hotkeys; index.html script order.
7) audio.js for SFX; optional touch overlay; polish.
