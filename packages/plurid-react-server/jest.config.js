module.exports = {
    transform: {
        '.(ts|tsx)': 'ts-jest'
    },
    testEnvironment: 'node',
    testRegex: '(/__specs__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js'
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0
            // branches: 90,
            // functions: 95,
            // lines: 95,
            // statements: 95
        }
    },
    collectCoverageFrom: [
        'source/*.{js,ts}'
    ]
}
