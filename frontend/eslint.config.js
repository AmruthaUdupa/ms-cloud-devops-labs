import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { document: 'readonly', window: 'readonly', fetch: 'readonly', history: 'readonly', console: 'readonly' }
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error'
    }
  },
  { ignores: ['dist/**', 'node_modules/**'] }
);
