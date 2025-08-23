import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: { js, prettier: prettierPlugin },
        extends: ['js/recommended'],
        languageOptions: { globals: globals.browser },
        rules: {
            // включаем автоформатирование через prettier
            'prettier/prettier': 'error',
        },
    },
    tseslint.configs.recommended,
]);
