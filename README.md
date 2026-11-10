# OSIRIS: THE LAST INTELLIGENCE — First playable build

## Included
- Vite + React + TypeScript foundation
- React Three Fiber 3D pyramid chamber
- Stylized placeholder explorer
- Mobile joystick and interact button
- Desktop WASD / arrow-key movement
- Cinematic lighting, fog, pillars, sealed gate and floating memory shard
- Initial HUD and artifact discovery state

## Run locally
```bash
npm install
npm run dev -- --host 0.0.0.0
```
Open `http://localhost:5173` on the same device.

## Production build
```bash
npm run build
npm run preview -- --host 0.0.0.0
```

## Current prototype limitations
This is the first playable foundation, not the complete vertical slice. The player and environment use procedural placeholder geometry; there is no animated character model, combat, puzzle sequence, audio, cloud save, or AI dialogue yet. The artifact interaction is a first interaction-state prototype and will be refined with proper player-position state and proximity feedback in the next build.

## Next implementation tasks
1. Add reliable player world-position state and camera look controls.
2. Add proper collision volumes and a mobile-friendly camera drag zone.
3. Replace placeholder player with optimized GLB character and animation.
4. Add the first three-step hieroglyph puzzle and door unlock.
5. Add guardian encounter, health and combat.
6. Add Osiris hologram dialogue and chapter completion.
7. Optimize assets and profile on target Android devices.
