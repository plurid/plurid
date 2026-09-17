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
    // THE FLOORS ARE MEASURED, not aspired to (2026-09-13, re-measured after the deprecation sweep):
    // each is this package's own coverage on the day it was set, rounded down to a multiple of five —
    // and one step further where that would have left under a point of room, because a floor sitting
    // ON its measurement goes red the first time anyone adds an uncovered function, which is a
    // failure about nothing. A floor from reality cannot be cargo-culted and cannot silently rot; it
    // only ever moves UP, in the commit that earns it.
    coverageThreshold: {
        global: {
            branches: 61,
            functions: 61,
            lines: 69,
            statements: 69,
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
