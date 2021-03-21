default:docker-build

install:
	npm install
docker-install:
	docker-compose run --rm app install

upgrade:
	npm upgrade
docker-upgrade:
	docker-compose run --rm app upgrade
	# docker-compose run --rm --entrypoint=npm app audit fix --force
build:
	npm run build
docker-build:
	docker-compose run --rm app build

start:
	npm start
docker-start:
	docker-compose up -d start

test:
	npm test
docker-test:
	docker-compose run --rm app test
