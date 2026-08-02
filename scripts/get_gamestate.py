#!/usr/bin/env python3
import argparse
import json
import sys
import urllib.error
import urllib.request


def main():
    parser = argparse.ArgumentParser(description="Fetch the current shapez RL gamestate snapshot.")
    parser.add_argument(
        "--url",
        default="http://127.0.0.1:17872/rl/gamestate",
        help="RL gamestate endpoint URL",
    )
    parser.add_argument("--timeout", type=float, default=10.0, help="Request timeout in seconds")
    parser.add_argument("--compact", action="store_true", help="Print compact JSON instead of pretty JSON")
    args = parser.parse_args()

    request = urllib.request.Request(args.url, headers={"Accept": "application/json"})

    try:
        with urllib.request.urlopen(request, timeout=args.timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as ex:
        body = ex.read().decode("utf-8", "replace")
        print(f"HTTP {ex.code}: {body}", file=sys.stderr)
        return 1
    except urllib.error.URLError as ex:
        print(f"Failed to connect to {args.url}: {ex}", file=sys.stderr)
        return 1
    except TimeoutError:
        print(f"Timed out waiting for {args.url}", file=sys.stderr)
        return 1

    if args.compact:
        print(json.dumps(payload, separators=(",", ":")))
    else:
        print(json.dumps(payload, indent=2, sort_keys=True))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
