import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import { fileURLToPath } from 'node:url';
import globals from 'globals';
import js from '@eslint/js';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    extends: compat.extends('eslint:recommended'),
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha
      }
    }
  },
  {
    rules: {
      semi: [2, 'always'],
      quotes: [2, 'single'],
      'no-unused-vars': [2, { args: 'after-used' }]
    }
  }
]);
