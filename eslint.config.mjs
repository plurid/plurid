// Flat ESLint config (ESLint 10 / typescript-eslint 8) — replaces the per-package
// `configurations/.eslintrc.js`. Mirrors the old baseline: eslint:recommended +
// @typescript-eslint/eslint-recommended + the three project rule-offs.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';


export default tseslint.config(
    {
        ignores: [
            '**/distribution/**',
            '**/node_modules/**',
            '**/templates/**',
            '**/unsource/**',
            '**/scripts/**',
            '**/tests/**',
            '**/configurations/**',
            '**/*.config.*',
            '**/.eslintrc.*',
            // Archived (excluded from the workspace) + out-of-workspace demos / non-workspace pkgs.
            'packages/plurid-web/plurid-works/plurid-canvas/**',
            'packages/plurid-web/plurid-works/plurid-html/**',
            'packages/plurid-web/plurid-browser/**',
            'fixtures/extras/**',
            'fixtures/plurid-react-*/**',
        ],
    },

    js.configs.recommended,
    tseslint.configs.eslintRecommended,

    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        rules: {
            'no-unused-vars': 'off',
            'no-empty': 'off',
            'no-case-declarations': 'off',
            // New in the ESLint 9/10 recommended set — kept OFF to match the prior eslint-8 baseline
            // exactly (a "same rules, newer engine" migration). `no-useless-assignment` is noisy on
            // valid patterns (setState updaters, default-then-overridden locals); `preserve-caught-error`
            // wants `{ cause }` on every rethrow. Adopt them as a follow-up quality pass.
            'no-useless-assignment': 'off',
            'preserve-caught-error': 'off',
        },
    },
);
