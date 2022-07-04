install:
	npm install

ci:
	npm ci

build:
	npm run dev

start:
	NODE_ENV=production npx webpack serve

lint:
	npx eslint .

test: 
	npm test
