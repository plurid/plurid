module.exports = {
    transform: {
        '.(ts|tsx)': 'ts-jest',
    },
    testEnvironment: 'node',
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/distribution/',
    ],
    // THE FLOORS ARE MEASURED, not aspired to (2026-09-13): each is this package's own coverage on
    // the day it was set, rounded down to the nearest five. A floor from reality cannot be
    // cargo-culted and cannot silently rot — it only ever moves up, by `pnpm test` and this number.
    coverageThreshold: {
        global: {
            branches: 55,
            functions: 55,
            lines: 65,
            statements: 65,
        },
    },
    collectCoverageFrom: [
        'source/**/*.{ts,tsx}',
        '!source/**/__tests__/**',
    ],
    moduleDirectories: [
        'node_modules',
        'source',
    ],
    // The `~` path aliases, ANCHORED — unanchored patterns swallowed relative imports such as
    // `./components/PlaneBridge` and mapped them to the wrong directory.
    moduleNameMapper: {
        '^~data/(.*)$': '<rootDir>/source/data/$1',
        '^~components/(.*)$': '<rootDir>/source/components/$1',
        '^~containers/(.*)$': '<rootDir>/source/containers/$1',
        '^~services/(.*)$': '<rootDir>/source/services/$1',
    },
}
