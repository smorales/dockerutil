#!/usr/bin/env sh

## Ensure the app's dependencies are installed
if [ $ENV = "prod" ]; then
    HEX_HTTP_TIMEOUT=120 mix deps.get --only prod
else
    HEX_HTTP_TIMEOUT=120 mix deps.get
fi

mix compile

## Potentially Set up the database
mix ecto.create
mix ecto.migrate
mix run priv/repo/seeds.exs
#
mix phx.server