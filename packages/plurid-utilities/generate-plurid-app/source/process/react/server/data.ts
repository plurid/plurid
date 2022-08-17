// #region module
export const requiredDependencies = [
    '@plurid/generate-plurid-app',
    '@plurid/elementql',
    '@plurid/elementql-client-react',
    '@plurid/plurid-data',
    '@plurid/plurid-engine',
    '@plurid/plurid-functions',
    '@plurid/plurid-functions-react',
    '@plurid/plurid-icons-react',
    '@plurid/plurid-pubsub',
    '@plurid/plurid-react',
    '@plurid/plurid-themes',
    '@plurid/plurid-ui-components-react',
    '@plurid/plurid-ui-state-react',
    '@plurid/plurid-react-server',
    '@reduxjs/toolkit',
    'cross-fetch',
    'cors',
    'dotenv',
    'hammerjs',
    'react',
    'react-dom',
    'react-helmet-async',
    'react-redux',
    'styled-components',
];


export const requiredDevelopmentDependencies = [
    '@types/cors',
    '@rollup/plugin-commonjs',
    '@rollup/plugin-json',
    '@rollup/plugin-node-resolve',
    '@rollup/plugin-url',
    '@vitejs/plugin-react',
    'compression-webpack-plugin',
    'concurrently',
    'copy-webpack-plugin',
    'css-loader',
    'eslint',
    'file-loader',
    'jest',
    'nodemon',
    'open',
    'redux-devtools-extension',
    'rimraf',
    'rollup',
    'rollup-plugin-peer-deps-external',
    'rollup-plugin-sourcemaps',
    'rollup-plugin-postcss',
    'rollup-plugin-terser',
    'postcss',
    'source-map-loader',
    'style-loader',
    'terser-webpack-plugin',
    'vite',
    'vite-tsconfig-paths',
    'webpack',
    'webpack-bundle-analyzer',
    'webpack-cli',
    'webpack-merge',
    'webpack-node-externals',
];

export const requiredDevelopmentTypescriptDependencies = [
    '@types/express',
    '@types/jest',
    '@types/node',
    '@types/react',
    '@types/react-dom',
    '@types/react-redux',
    '@types/styled-components',
    '@types/styled-components',
    '@types/react-stripe-elements',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser',
    'rollup-plugin-typescript2',
    'tslib',
    'ts-loader',
    'ts-jest',
    'tsconfig-paths-webpack-plugin',
    'typescript',
    'typescript-plugin-styled-components',
];

export const requiredDevelopmentJavascriptDependencies = [
    '@babel/core',
    '@babel/preset-env',
    '@babel/preset-react',
    'babel-loader',
    '@rollup/plugin-babel',
];


export const gitIgnore = `### NODE ###
# Created by https://www.gitignore.io/api/node
# Edit at https://www.gitignore.io/?templates=node

### Node ###
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Build
build

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.sh
.env.local
.env.development
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache

# rollup.js default build output
dist/
distribution/

# Storybook build outputs
.out
.storybook-out

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# Temporary folders
tmp/
temp/

# Docker build
.docker-build.local.sh
.npmrc.local

# End of https://www.gitignore.io/api/node



### SECRETS ###
.keys



### OS ###
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`
// #endregion module