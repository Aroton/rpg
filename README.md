# FF1 Foundation (RPG Prototype)

Minimal JRPG-style overworld and combat prototype built with vanilla HTML5 Canvas and JavaScript. Move around a small tile map, trigger random encounters, and fight a simple enemy using turn-based commands.

## Quick Start

- Option A (open directly): double-click `index.html` (works in most browsers since there are no external assets)
- Option B (recommended): serve locally to avoid any browser restrictions
  - Python: `python -m http.server 8000` then visit http://localhost:8000
  - Node: `npx http-server . -p 8000` then visit http://localhost:8000

Canvas is 320x240 with pixelated scaling for a crisp retro look.

## Controls

- Overworld: Arrow keys to move
- Battle: Enter or Space to confirm menu choices (Attack / Defend / Run)
- Game Over: Enter to restart
- Testing: Press `9` to auto-queue 10 back-to-back battles

## Gameplay Overview

- Overworld
  - 10x10 tile map with borders; camera centers on the player and clamps to map bounds
  - Tile types: 0=walkable, 1=solid, 2=encounter zone (slightly higher encounter rate via terrain modifier)
- Encounters
  - Encounter check happens after completing a step between tiles
  - Step threshold is randomized between min/max; once reached, a roll occurs using base rate × terrain modifier
  - On success, a battle versus a simple "Slime" is started
- Combat
  - Turn order per round is based on Speed plus a d20 roll; highest acts first
  - Actions: Attack, Defend (halves next damage), Run (chance based on speed difference)
  - Hit chance scales with attacker Accuracy and defender Evasion; critical chance scales with weapon crit and level
  - Simple AI: mostly attacks; may defend at low HP
  - Floating combat text displays damage, MISS, WIN/LOSE/ESCAPE

## Project Structure

```
index.html            # Entry point, canvas, and script loading order
style.css             # Centering and pixelated rendering
src/
  core/
    boot.js           # Canvas/context init, global Game object and timing vars
    input.js          # Key state: down/pressed/released, per-frame reset
    loop.js           # requestAnimationFrame loop: update/render, dt clamped
  engine/
    renderer.js       # Primitive drawing (rect/text/window boxes, tilemap)
    ui.js             # Minimal UI components (e.g., Menu with cursor)
  utils/
    math.js           # clamp, randInt, chance helpers
  game/
    constants.js      # Tunables: tile size, move speed, encounter rates
    levels.js         # Test map data and terrain modifiers
    player.js         # Grid movement, camera, onStep callback
    encounters.js     # Random encounter thresholds and enemy generation
    combat.js         # Battle flow, turn order, damage/hit/run calculations
    main.js           # Overworld scene, fades, HUD, battle transitions, Game Over
```

## Tuning & Customization

- Movement
  - `src/game/constants.js`: adjust `MOVE_SPEED_PPS` to change travel speed
- Encounters
  - `ENCOUNTER_BASE_RATE`, `STEP_THRESHOLD_MIN`, `STEP_THRESHOLD_MAX` control frequency
  - `levels.js` `terrainMod` maps tile type to encounter multiplier (e.g., grass vs. road)
- Map
  - `levels.js` currently generates a 10×10 test map programmatically; swap for authored data as needed
  - Tile meanings: 0=walkable, 1=blocked, 2=encounter zone
- Enemies
  - `encounters.js` `generateEnemy()` returns the current test enemy; extend to return different enemies or weighted tables
- Combat Balance
  - `combat.js` contains formulas for hit chance, crits, run chance, and damage; adjust values to fit desired feel

## Development Notes

- Rendering uses simple primitives; there are no external assets, so it runs anywhere
- The UI includes window boxes and a basic list menu with cursor and keyboard navigation
- The overworld includes a short fade-to-battle/battle-to-overworld transition

## Roadmap Ideas

- Multiple enemy types and formations; enemy behaviors beyond defend/attack
- Player stats growth, leveling thresholds, and simple equipment/items
- Better visuals (sprites, animations, particles) and sound effects
- Larger maps, doors/warps, towns/dungeons, and NPC dialog
- Save/load (localStorage) and basic settings menu
- Mobile/touch controls and resolution scaling options

## Status

Prototype-quality code intended for experimentation and iteration. No license specified.
