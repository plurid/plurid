module.exports = {
    rootDir: '../',
    transform: {
        '.(ts|tsx)': 'ts-jest'
    },
    testEnvironment: 'node',
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    testPathIgnorePatterns: [
        'data',
    ],
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js'
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/build/'
    ],
    // THE FLOORS ARE MEASURED, not aspired to (2026-09-13): each is this package's own coverage on
    // the day it was set, rounded down to the nearest five. A floor from reality cannot be
    // cargo-culted and cannot silently rot — it only ever moves up, by `pnpm test` and this number.
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 45,
            statements: 50,
        },
    },
    collectCoverageFrom: [
        'source/**/*.{ts,tsx}',
        '!source/**/__tests__/**',
    ],
    testTimeout: 30000
}
