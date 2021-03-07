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
        'source/*.{js,ts}',
    ],
    moduleDirectories: [
        'node_modules',
        'source',
    ],
    moduleNameMapper: {
        "Application/(.*)": "<rootDir>/source/Application/$1",
        "components/(.*)": "<rootDir>/source/modules/components/$1",
        "containers/(.*)": "<rootDir>/source/modules/containers/$1",
        "services/(.*)": "<rootDir>/source/modules/services/$1",
    },
}
