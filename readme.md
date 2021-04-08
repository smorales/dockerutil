# Dockerutil

Dockerutil is a commandline utility which helps to setup docker environments for Elixir/Phoenix or Laravel projetcs.

## Install
```shell
npm install -g @smorales/dockerutil
```

## Usage

### Init

To initialize just `cd` to the projet folder and run `dockerutil init`.
After answering all questions, a folder named `docker` will be created at the root of the project directory.  

Example:
```shell
# create new laravel project
laravel new test-project

# get into projects folder
cd test-project

# setup docker (select laravel when asking for project type)
dockerutil init

# start the service
dockerutil up dev
```

![dockerutil-setup](https://raw.githubusercontent.com/smorales/dockerutil/master/images/dockerutil-setup.gif)


