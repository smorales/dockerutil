FROM elixir:alpine

ENV MIX_ENV=test
ENV ENV=test

RUN mkdir /app

# Install Phoenix packages
RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix archive.install --force hex phx_new __PHOENIX_VERSION__

RUN apk update
RUN apk add --no-cache bash
RUN apk add inotify-tools

##################################
## Necessary for the bcrypt lib ##
##################################
RUN apk add gcc
RUN apk add make
RUN apk add libc-dev
##################################

ENTRYPOINT chmod 777 docker/test/run.sh
ENTRYPOINT ./__DOCKER_UTIL_DIR__/test/run.sh

EXPOSE 4000