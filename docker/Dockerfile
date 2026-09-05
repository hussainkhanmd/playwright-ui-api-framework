# Consistent local/CI execution on the official Playwright image
# (browsers + OS deps preinstalled; the tag must track @playwright/test).
FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

# Install deps first so the layer caches unless the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Default: run the full suite. Override, e.g.:
#   docker run --rm pwf npm run test:api
#   docker run --rm -e TEST_ENV=staging pwf npm run test:smoke
ENV CI=true
CMD ["npm", "test"]
