deploy:
	@echo "Running tests..."
	npx vitest run
	@echo "Tests passed. Running build..."
	npm run build
	@echo "Build successful. Deploying to Firebase..."
	firebase deploy

build:
	@echo "Running tests..."
	npx vitest run
	@echo "Tests passed. Running build..."
	npm run build