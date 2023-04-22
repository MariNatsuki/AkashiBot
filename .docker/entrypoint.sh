#!/bin/sh

set -e

# export SECRET ENV

# Run our defined exec if args empty
if [ -z "$1" ]; then
  cd /home/akashibot

  env=${APP_ENV:-production}

  if [ "$env" = "local" ] ||  [ "$env" = "development" ]; then
    npm install
    exec npm run start:dev
  else
    exec npm run start:prod
  fi

else
  exec "$@"
fi
