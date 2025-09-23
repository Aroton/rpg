# Snake

## Game Overview
A modern, neon-styled Snake game. Eat food to grow the snake, avoid walls and your own tail, and chase a new high score. Smooth, fixed-step gameplay with clean visuals and subtle audio gives a focused arcade feel.

## Architecture Summary
Vanilla HTML/CSS/JS under a global `window.Game` namespace; no build step required.
- Main loop (`game.js`) — requestAnimationFrame render with fixed-step updates via accumulator; input binding; optional `#btn-start`/`#btn-pause` wiring.
- Gameplay (`entities.js`) — snake state, food spawning, scoring, high score persistence, keyboard handling, scheme cycling, and neon drawing.
- Physics helpers (`physics.js`) — next-position calculation, bounds checks, self-collision, and rounded-rect path utility.
- Audio system (`systems/audio.js`) — user-gesture gated Web Audio; looping background tone sequence; eat SFX.
- UI & Styling (`index.html`, `style.css`) — DOM scoreboard (Score/Best) with aria-live regions and an instruction tooltip; responsive canvas panel styling.

## File Index
### Core Systems
- `index.html` — Entry point; titled header + HUD; accessible hint; `<canvas id="game-canvas">`; loads scripts in order: physics → entities → systems/audio → game.
- `style.css` — Theme variables, title/HUD chips, responsive canvas panel with glow, instruction tooltip, subtle effects.
- `game.js` — Initialization, keyboard + pointer gesture wiring, fixed-step update with free rendering, optional Pause/Resume logic if `#btn-start`/`#btn-pause` exist.
- `entities.js` — Game state (running/over/score/high), update/draw, color scheme cycling on eat, HUD updates, localStorage key `snake_high`.
- `physics.js` — Grid step helpers and collision checks (out-of-bounds, self-hit), `roundRect(ctx, ...)` path builder used by rendering.
- `systems/audio.js` — Web Audio bootstrap and master gain; background tone loop; eat sound effect; `ensureStart()` for gesture-gated start.

## Current Features
- ✅ External scoreboard (Score, Best) in the top header; updates via DOM (#score, #best)
- ✅ Keyboard controls: Arrow Keys or WASD; Space to restart after Game Over
- ✅ High score persistence via localStorage (`snake_high`)
- ✅ Neon visual effects (glow grid, strobe hues, trail highlights) with color scheme cycling on food pickup
- ✅ Background “tone scale” ambience and juicy eat SFX (starts on first key press/tap)
- ✅ Responsive canvas sizing with polished panel styling and instruction tooltip

## Controls
- Move: Arrow Keys or WASD
- Restart (after Game Over): Spacebar
- Enable audio: First key press or tap/click on the canvas (required by browsers for Web Audio)

## Configuration
Grid and timing are defined in `entities.js` as:
- `tile`: 24 — pixel size of a cell
- `cols`: 24 — grid width in cells
- `rows`: 18 — grid height in cells
- `stepMs`: 110 — milliseconds per movement step (game speed)

Adjust these values to change board size or speed. The canvas is set to match `cols * tile` by `rows * tile` at initialization.

## How to Run
- Open `index.html` in a modern desktop or mobile browser
- Interact once (keypress/tap) to enable audio; then play
- Optional: serve via a simple HTTP server for consistent behavior across browsers

## Accessibility
- Canvas has `role="img"` and a descriptive `aria-label` for assistive tech.
- Header/HUD provide live score updates via `aria-live="polite"` on scoreboard chips.
- Hint tooltip uses `role="note"` and avoids flashing animations by default.

## Known Issues / Limitations
- Pause/resume APIs exist but no visible Pause button in the UI (hooks in `game.js` for `#btn-pause`/`#btn-start` if added).
- `entities.js` mixes update and render for convenience; consider splitting if it grows further.
- No on-screen touch controls beyond the initial tap for audio; swipe/D-pad UI would help mobile users.
- Background audio currently runs independently of game pause; consider pausing/resuming ambience with game state.
- High-DPI polish: consider scaling the canvas backing store to `devicePixelRatio` for crisper rendering while keeping responsive CSS sizing.

## Backlog / Next Steps (Prioritized)
1. Add Pause/Resume UI buttons and wire to existing hooks in `game.js`.
2. Implement mobile-friendly controls (swipe or on-screen D-pad) with debounce and direction-queueing.
3. Split `entities.js` into `logic` and `render` modules to stay under ~100 lines each as features grow.
4. Tie background audio to game state (pause/resume) and add an in-UI mute toggle.
5. Add high-DPI canvas scaling and resize handling for sharper visuals on Retina displays.
6. Optional: Difficulty settings (speed ramp, board size presets) exposed via simple UI.

## Key Patterns
- DOM HUD + canvas gameplay separation keeps rendering focused and UI crisp.
- Fixed timestep updates with free rendering for consistent motion at any framerate.
- Gesture-gated Web Audio to comply with browser autoplay policies.
- LocalStorage-backed high score with graceful fallback.
