#!/bin/sh

set -e

# export SECRET ENV

# Run our defined exec if args empty
if [ -z "$1" ]; then
  cd /usr/src/app

  env=${APP_ENV:-production}

  if [ "$env" = "local" ] || [ "$env" = "development" ]; then
    bun install
    exec bun start:dev
  else
    exec bun run start:prod
  fi

else
  exec "$@"
fi
