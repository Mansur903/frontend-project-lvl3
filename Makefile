install:
	npm install

ci:
	npm ci

build:
	npm run build

start:
	NODE_ENV=development npx webpack serve

lint:
	npx eslint .

test: 
	npm test
