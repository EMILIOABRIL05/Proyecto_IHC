import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/generated/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'apps/web/src/components/ui/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      // Sin `any` ni supresiones para "hacer pasar" el lint (AGENTS.md §4).
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'error',
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    files: ['apps/web/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    // Los scripts y las pruebas e2e pueden escribir en consola.
    files: ['**/*.config.{js,ts}', 'apps/api/prisma/seed.ts', 'apps/web/e2e/**'],
    rules: { 'no-console': 'off' },
  },
  prettier,
);
