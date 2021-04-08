#!/usr/bin/env sh

mix deps.get
ENV=test mix test