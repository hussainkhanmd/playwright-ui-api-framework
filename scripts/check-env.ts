/**
 * Preflight: validate .env / environment and print the resolved configuration.
 *
 *   npm run check:env
 *
 * Exits non-zero with a readable message if anything is missing or malformed,
 * so CI can gate on config before spinning up browsers.
 */

function mask(value: string | undefined): string {
  if (!value) return '(not set)';
  return value.length <= 8 ? '****' : `${value.slice(0, 4)}…${value.slice(-2)}`;
}

try {
  const { config } = await import('../src/common/config/config.js');

  console.log('✓ Environment configuration is valid.\n');
  console.table({
    TEST_ENV: config.testEnv,
    'urls.ui': config.urls.ui,
    'urls.api': config.urls.api,
    'urls.theInternet': config.urls.theInternet,
    'mock.autoStart': config.mock.autoStart,
    'mock.url': config.mock.url,
    'credentials.username': config.credentials.username,
    'credentials.password': mask(config.credentials.password),
    'timeouts.default': config.timeouts.default,
    isCI: config.isCI,
    'ai.enabled': config.ai.enabled,
    'ai.model': config.ai.model,
    'ai.apiKey': mask(config.ai.apiKey),
    LOG_LEVEL: config.env.LOG_LEVEL,
  });
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
