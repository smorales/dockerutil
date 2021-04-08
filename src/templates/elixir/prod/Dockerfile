FROM elixir:alpine AS build

ENV MIX_ENV=prod
ENV ENV=prod

# Create ambient
RUN mkdir /app
COPY . /app
WORKDIR /app

# Install Phoenix packages
RUN mix local.hex --force
RUN mix local.rebar --force
RUN mix archive.install --force hex phx_new __PHOENIX_VERSION__

# Install dependencies
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

# Compile everything
RUN mix do deps.get, deps.compile
RUN mix do compile, release

##################################
#     PREPARE RELEASE IMAGE      #
##################################
FROM alpine:3.9 AS app
RUN apk update
RUN apk add --no-cache openssl ncurses-libs

# --------------------------------
WORKDIR /app
RUN chown nobody:nobody /app
USER nobody:nobody
COPY --from=build --chown=nobody:nobody /app/_build/prod/rel/api ./
ENV HOME=/app
#CMD ["bin/api", "eval", "Api.ReleaseTasks.migrate"]
CMD ["bin/api", "start"]
