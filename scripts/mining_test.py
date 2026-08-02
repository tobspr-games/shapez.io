#!/usr/bin/env python3
import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request


TARGET_SHAPE = "CuCuCuCu"
HUB_LEFT_INPUT_X = -3
HUB_LEFT_INPUT_Y = 1
STARTER_MAP_WINDOW = {"x": -16, "y": -16, "w": 32, "h": 32}


def request_json(url, method="GET", payload=None, timeout=10.0):
    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def get_json(base_url, path, params=None, timeout=10.0):
    query = ""
    if params:
        query = "?" + urllib.parse.urlencode(params)
    return request_json(base_url + path + query, timeout=timeout)


def post_json(base_url, path, payload=None, timeout=10.0):
    return request_json(base_url + path, method="POST", payload=payload or {}, timeout=timeout)


def stored_shape_count(gamestate, shape_key):
    return gamestate["savegame"]["dump"]["hubGoals"]["storedShapes"].get(shape_key, 0)


def occupied_tiles(buildings):
    occupied = set()
    for building in buildings:
        bounds = building.get("bounds", {})
        x0 = bounds.get("x")
        y0 = bounds.get("y")
        width = bounds.get("w")
        height = bounds.get("h")
        if not all(isinstance(value, int) for value in (x0, y0, width, height)):
            continue
        for x in range(x0, x0 + width):
            for y in range(y0, y0 + height):
                occupied.add((x, y))
    return occupied


def route_tiles_from_resource(resource):
    rx = resource["x"]
    ry = resource["y"]
    tiles = []

    for x in range(rx + 1, HUB_LEFT_INPUT_X):
        tiles.append((x, ry))

    tiles.append((HUB_LEFT_INPUT_X, ry))

    for y in range(ry - 1, HUB_LEFT_INPUT_Y, -1):
        tiles.append((HUB_LEFT_INPUT_X, y))

    tiles.append((HUB_LEFT_INPUT_X, HUB_LEFT_INPUT_Y))
    return tiles


def route_conflicts_with_buildings(resource, occupied):
    return (resource["x"], resource["y"]) in occupied or any(
        tile in occupied for tile in route_tiles_from_resource(resource)
    )


def find_starter_circle_resource(map_data):
    occupied = occupied_tiles(map_data["buildings"])
    candidates = [
        resource
        for resource in map_data["resources"]
        if resource["type"] == "shape"
        and resource["key"] == TARGET_SHAPE
        and resource["x"] <= HUB_LEFT_INPUT_X - 1
        and resource["y"] > HUB_LEFT_INPUT_Y
        and not route_conflicts_with_buildings(resource, occupied)
    ]
    if not candidates:
        raise AssertionError(f"No routeable {TARGET_SHAPE} starter resource found in map window")

    return min(
        candidates,
        key=lambda resource: abs(resource["x"] - HUB_LEFT_INPUT_X)
        + abs(resource["y"] - HUB_LEFT_INPUT_Y),
    )


def build_mining_placements(resource):
    rx = resource["x"]
    ry = resource["y"]
    placements = [
        {"id": "miner", "x": rx, "y": ry, "rotation": 90, "rotationVariant": 0},
    ]

    for x in range(rx + 1, HUB_LEFT_INPUT_X):
        placements.append({"id": "belt", "x": x, "y": ry, "rotation": 90, "rotationVariant": 0})

    placements.append(
        {
            "id": "belt",
            "x": HUB_LEFT_INPUT_X,
            "y": ry,
            "rotation": 90,
            "rotationVariant": 1,
        }
    )

    for y in range(ry - 1, HUB_LEFT_INPUT_Y, -1):
        placements.append(
            {"id": "belt", "x": HUB_LEFT_INPUT_X, "y": y, "rotation": 0, "rotationVariant": 0}
        )

    placements.append(
        {
            "id": "belt",
            "x": HUB_LEFT_INPUT_X,
            "y": HUB_LEFT_INPUT_Y,
            "rotation": 0,
            "rotationVariant": 2,
        }
    )
    return placements


def place_buildings(base_url, placements, timeout):
    for placement in placements:
        response = post_json(base_url, "/rl/building", payload=placement, timeout=timeout)
        if not response.get("placed"):
            raise AssertionError(f"Placement did not report success: {response}")


def tick_until_shape_increases(base_url, shape_key, before_count, total_ticks, tick_chunk, timeout):
    if total_ticks <= 0:
        raise AssertionError("--ticks must be positive")
    if tick_chunk <= 0:
        raise AssertionError("--tick-chunk must be positive")

    ticks_remaining = total_ticks
    latest_state = None
    while ticks_remaining > 0:
        ticks = min(ticks_remaining, tick_chunk)
        latest_state = post_json(base_url, "/rl/tick", payload={"ticks": ticks}, timeout=timeout)
        if stored_shape_count(latest_state, shape_key) > before_count:
            return latest_state
        ticks_remaining -= ticks

    return latest_state


def main():
    parser = argparse.ArgumentParser(description="Mine the first shape resource via the shapez RL API.")
    parser.add_argument("--base-url", default="http://127.0.0.1:17872", help="RL API base URL")
    parser.add_argument("--timeout", type=float, default=10.0, help="Request timeout in seconds")
    parser.add_argument("--ticks", type=int, default=2500, help="Ticks to run after placing the miner")
    parser.add_argument("--tick-chunk", type=int, default=300, help="Maximum ticks per /rl/tick request")
    args = parser.parse_args()

    try:
        post_json(args.base_url, "/rl/destroy-removable-buildings", timeout=args.timeout)
        before_state = get_json(args.base_url, "/rl/gamestate", timeout=args.timeout)
        before_count = stored_shape_count(before_state, TARGET_SHAPE)

        map_data = get_json(args.base_url, "/rl/map", params=STARTER_MAP_WINDOW, timeout=args.timeout)
        resource = find_starter_circle_resource(map_data)
        placements = build_mining_placements(resource)
        place_buildings(args.base_url, placements, args.timeout)

        after_state = tick_until_shape_increases(
            args.base_url, TARGET_SHAPE, before_count, args.ticks, args.tick_chunk, args.timeout
        )
        after_count = stored_shape_count(after_state, TARGET_SHAPE)
        if after_count <= before_count:
            raise AssertionError(
                f"Expected {TARGET_SHAPE} count to increase, before={before_count}, after={after_count}"
            )
    except urllib.error.HTTPError as ex:
        body = ex.read().decode("utf-8", "replace")
        print(f"HTTP {ex.code}: {body}", file=sys.stderr)
        return 1
    except (urllib.error.URLError, TimeoutError, AssertionError, KeyError, TypeError) as ex:
        print(f"RL mining test failed: {ex}", file=sys.stderr)
        return 1

    print(
        f"Mined {TARGET_SHAPE}: {before_count} -> {after_count} "
        f"using resource ({resource['x']}, {resource['y']})."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
