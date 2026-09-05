// Flat config (ESLint 9). Run: `npm run lint`
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'reports/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      'allure-results/**',
      'allure-report/**',
      'logs/**',
      'dist/**',
      'tests/visual/**/*-snapshots/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', 'allurerc.mjs', '.prettierrc.json'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'off',
    },
  },

  // Test specs: enforce Playwright best practices (no hard waits, proper assertions).
  {
    files: ['tests/**/*.spec.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'warn',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-conditional-in-test': 'warn',
    },
  },

  // Playwright fixtures use the `async ({}, use) => {}` idiom to declare "no deps".
  {
    files: ['src/common/fixtures/**/*.ts'],
    rules: {
      'no-empty-pattern': 'off',
    },
  },

  // Config / scripts / mocks / reporters may use console and Node globals freely.
  {
    files: [
      'scripts/**/*.ts',
      'mocks/**/*.ts',
      'src/common/reporting/**/*.ts',
      '*.mjs',
      '*.config.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },

  prettier,
);
