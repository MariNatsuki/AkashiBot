PROJECT_NAME=akashi-bot
THIS_FILE := $(lastword $(MAKEFILE_LIST))

.PHONY: help
help:
	make -pRrq  -f $(THIS_FILE) : 2>/dev/null | awk -v RS= -F: '/^# File/,/^# Finished Make data base/ {if ($$1 !~ "^[#.]") {print $$1}}' | sort | egrep -v -e '^[^[:alnum:]]' -e '^$@$$'

.PHONY: prepare
prepare:
	mkdir -p .docker/redis/data
	sudo chown 1001 .docker/redis/data

.PHONY: build
build:
	docker compose -p $(PROJECT_NAME) build

.PHONY: up
up:
	docker compose -p $(PROJECT_NAME) up

.PHONY: start
start:
	docker compose -p $(PROJECT_NAME) up -d

.PHONY: up-build
up-build: build up

.PHONY: start-build
start-build: build start

up-dev:
	docker compose -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.dev.yml up
up-dev-build:
	docker compose -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.dev.yml up --build

.PHONY: down
down:
	docker compose down

.PHONY: clean
clean: down
	docker ps -a | awk '/$(PROJECT_NAME)/ { print $$1 }' | xargs docker rm -f
	docker images -a | awk '/$(PROJECT_NAME)/ { print $$3 }' | xargs docker rmi -f
