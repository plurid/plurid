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
            // a package's own dev scripts stay out; the ROOT `scripts/` are the gate and are linted
            'packages/**/scripts/**',
            'fixtures/**/scripts/**',
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

    {
        // The gate scripts are Node programs: they run the build, the module check, the docs tables and
        // the packed smoke test, and a mistake in one of them fails the repository's verification —
        // so they are linted like everything else (they were ignored wholesale until 2026-09-13).
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },

    {
        /**
         * A TEST WAITS ON STATE, NEVER ON TIME (2026-09-13). A `page.waitForTimeout` is a guess about
         * a machine: right on a development laptop, wrong on a loaded CI runner — which is how a
         * suite starts failing for reasons that say nothing about the code. `e2e/helpers.ts` carries
         * the vocabulary that replaces every one of them, and the suite has none left, so this rule
         * has no exceptions to make.
         */
        files: ['fixtures/render-test/e2e/**/*.ts'],
        rules: {
            'no-restricted-syntax': ['error', {
                selector: "CallExpression[callee.property.name='waitForTimeout']",
                message: 'a test waits on STATE, never on time — use waitForState / afterFrames / waitQuiet / expect.poll from ./helpers (see the header of helpers.ts).',
            }],
        },
    },
);
