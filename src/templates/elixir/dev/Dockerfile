FROM elixir:alpine

RUN mkdir /app

# Install Phoenix packages
RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix archive.install --force hex phx_new __PHOENIX_VERSION__

# Install node
RUN apk update
RUN apk add --no-cache bash
RUN apk add --no-cache git
RUN apk add --no-cache openssh
RUN apk add inotify-tools

##################################
## Necessary for the bcrypt lib ##
##################################
RUN apk add gcc
RUN apk add make
RUN apk add libc-dev
##################################

ENTRYPOINT chmod 777 docker/dev/run.sh
ENTRYPOINT ./__DOCKER_UTIL_DIR__/dev/run.sh

EXPOSE 4000