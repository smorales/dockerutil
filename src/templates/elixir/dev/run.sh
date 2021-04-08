#!/usr/bin/env sh

## Ensure the app's dependencies are installed
if [ $ENV = "prod" ]; then
    HEX_HTTP_TIMEOUT=120 MIX_ENV=$ENV mix deps.get --only prod
else
    HEX_HTTP_TIMEOUT=120 MIX_ENV=$ENV mix deps.get
fi

MIX_ENV=$ENV mix compile

## Potentially Set up the database
MIX_ENV=$ENV mix ecto.create
MIX_ENV=$ENV mix ecto.migrate
MIX_ENV=$ENV mix run priv/repo/seeds.exs
#
MIX_ENV=$ENV mix phx.server