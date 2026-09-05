import type { Env } from './env.schema.js';

/**
 * Per-environment defaults. `config.ts` picks the block that matches
 * `TEST_ENV`, then lets explicit `*_BASE_URL` env vars override any field.
 *
 * The UI app-under-test is the public SauceDemo site (stable, purpose-built
 * for automation demos). `theInternet` covers edge-case scenarios (iframes,
 * shadow DOM, uploads/downloads, multi-window). `api` points at the local
 * json-server mock by default so API tests are deterministic and offline.
 */
export interface EnvironmentUrls {
  ui: string;
  api: string;
  theInternet: string;
}

type EnvName = Env['TEST_ENV'];

export const environments: Record<EnvName, EnvironmentUrls> = {
  dev: {
    ui: 'https://www.saucedemo.com',
    api: 'http://127.0.0.1:3001',
    theInternet: 'https://the-internet.herokuapp.com',
  },
  staging: {
    ui: 'https://www.saucedemo.com',
    api: 'http://127.0.0.1:3001',
    theInternet: 'https://the-internet.herokuapp.com',
  },
  prod: {
    ui: 'https://www.saucedemo.com',
    api: 'https://jsonplaceholder.typicode.com',
    theInternet: 'https://the-internet.herokuapp.com',
  },
};
