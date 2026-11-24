// ESLint flat config: https://eslint.org/docs/latest/use/configure/configuration-files
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'allure-*/', 'blob-report/'] },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Rules that need type information (they ask the TypeScript compiler about every expression)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // A Promise that is neither awaited nor returned: the classic forgotten `await`
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  // Playwright best practices, only for test files
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },

  // Turns off formatting rules that would fight with Prettier; must stay last
  prettier,
);
