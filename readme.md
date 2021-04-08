# Dockerutil

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

