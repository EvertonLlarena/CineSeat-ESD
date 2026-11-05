#!/usr/bin/env bash
# Checks a running stack: every service healthy and scraped by Prometheus.
set -euo pipefail

services=(gateway:3000 catalog:3001 reservations:3002 payment:3003 notifications:3004)

for entry in "${services[@]}"; do
  name=${entry%%:*}
  port=${entry##*:}
  docker compose exec -T "$name" wget -qO- "http://127.0.0.1:$port/health" | grep -q '"status":"ok"'
  echo "ok: $name /health"
done

curl -fsS http://127.0.0.1:3000/health | grep -q '"service":"gateway"'
echo "ok: gateway published on localhost"

for _ in $(seq 1 30); do
  up=$(curl -fsS http://127.0.0.1:9090/api/v1/targets | grep -o '"health":"up"' | wc -l)
  [ "$up" -ge "${#services[@]}" ] && { echo "ok: Prometheus scraping $up targets"; exit 0; }
  sleep 2
done

echo "fail: Prometheus scraping $up of ${#services[@]} targets" >&2
exit 1
