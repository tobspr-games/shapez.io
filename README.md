# shapez.io RL fork

This fork adds a headless Electron runtime and a local JSON API for reinforcement learning.

The upstream game is [tobspr-games/shapez.io](https://github.com/tobspr-games/shapez.io)

## What This Fork Adds

- A Nix flake for building
- headless buildd
- RL API
- test scripts in `scripts/`.

In headless mode, these are set:
- `disableUnlockDialog = true`
- `allBuildingsUnlocked = true`

## Build With Nix

```bash
nix run path:$PWD#rl
```

This starts:

- web server: `http://127.0.0.1:3005`
- RL API: `http://127.0.0.1:17872`

Relevant override with environment variables:

```bash
SHAPEZ_WEB_PORT=3006 \
SHAPEZ_RL_API_PORT=17873 \
SHAPEZ_RL_USER_DATA_DIR=/tmp/shapez-rl-17873 \
nix run path:$PWD#rl
```

### Get Game State

```http
GET /rl/gamestate
```

### Get Map Window

```http
GET /rl/map?x=-16&y=-16&w=32&h=32
```

### Reset Game

```http
POST /rl/reset
Content-Type: application/json

{ "seed": 12345, "goalLevel": 5 }
```

Starts a fresh game and returns the new gamestate. `seed` and `goalLevel` are optional.

### Tick Simulation

```http
POST /rl/tick
Content-Type: application/json

{ "ticks": 300 }
```

### Place Building

```http
POST /rl/building
Content-Type: application/json

{
  "id": "belt",
  "x": 10,
  "y": 0,
  "rotation": 90,
  "rotationVariant": 0
}
```

### Destroy Removable Buildings

```http
POST /rl/destroy-removable-buildings
```


## Smoke Test

With the RL app running:

```bash
python3 scripts/mining_test.py --base-url http://127.0.0.1:17872
```
