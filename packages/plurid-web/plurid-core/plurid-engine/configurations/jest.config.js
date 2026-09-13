module.exports = {
    rootDir: '../',
    transform: {
        '.(ts|tsx)': 'ts-jest',
    },
    testEnvironment: 'jsdom',
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
            branches: 75,
            functions: 85,
            lines: 85,
            statements: 85,
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
    moduleNameMapper: {
        "modules/(.*)": "<rootDir>/source/modules/$1",
        "interaction/(.*)": "<rootDir>/source/modules/interaction/$1",
        "setup/(.*)": "<rootDir>/source/modules/setup/$1",
        "utilities/(.*)": "<rootDir>/source/modules/utilities/$1",
    },
}
