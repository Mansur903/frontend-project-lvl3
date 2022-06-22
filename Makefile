install:
	npm install

build:
	npm run dev

webpack-server:
	npx webpack serve

lint:
	npx eslint .

test: 
	npm test

test-coverage:
	npm run test-coverage

test-watch:
	npx jest --watch