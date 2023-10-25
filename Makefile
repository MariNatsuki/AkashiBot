up:
	docker compose up
up-build:
	docker compose up --remove-orphans --build
up-dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --remove-orphans
up-dev-build:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --remove-orphans --build