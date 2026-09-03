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
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
            // branches: 90,
            // functions: 95,
            // lines: 95,
            // statements: 95
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
