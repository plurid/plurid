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
    // THE FLOORS ARE MEASURED, not aspired to (2026-09-13, re-measured after the deprecation sweep):
    // each is this package's own coverage on the day it was set, rounded down to a multiple of five —
    // and one step further where that would have left under a point of room, because a floor sitting
    // ON its measurement goes red the first time anyone adds an uncovered function, which is a
    // failure about nothing. A floor from reality cannot be cargo-culted and cannot silently rot; it
    // only ever moves UP, in the commit that earns it.
    coverageThreshold: {
        global: {
            branches: 30,
            functions: 85,
            lines: 90,
            statements: 90,
        },
    },
    collectCoverageFrom: [
        'source/**/*.{ts,tsx}',
        '!source/**/__tests__/**',
    ],
    testTimeout: 30000
}
