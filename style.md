# MMORPG Development Style Guide

This repository contains a browser-based MMORPG built with Node.js and Three.js and deployed with Netlify.

AI assistants working on this repository must prioritize:
- scalability
- deterministic multiplayer logic
- modular architecture
- browser performance
- Android compatibility

## Core Philosophy
Server authoritative architecture. Client renders only.

## Tech Stack
Frontend: Three.js, WebGL, WebSocket, ES Modules
Backend: Node.js WebSocket server
memchache elasticy
valk chache
postgre sql 2x
vpc 
windows server for red alert plans

## Rendering
Use GLB models, instancing, frustum culling, texture atlases.

## Performance
Support 100+ players per shard.
Avoid heavy loops and memory allocations.

## Systems
combatSystem.js
inventorySystem.js
npcSystem.js
guildSystem.js
economySystem.js
