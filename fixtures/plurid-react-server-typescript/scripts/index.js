const path = require('path');

const {
    existsSync,
} = require('fs');

const {
    execSync,
} = require('child_process');



/** CONSTANTS */
const command = process.argv[2];
const buildFolder = path.join(process.cwd(), 'build');



/** COMMANDS */
const commandStart = [
    'node build/server.js',
];

const commandRunDevelopment = [
    'nodemon build/server.js',
];
const commandRunProduction = [
    'node build/server.js',
];

const commandClean = [
    'rimraf ./build',
];

const commandBuildClientDevelopment = [
    'node_modules/.bin/webpack --config scripts/client.development.js',
];
const commandBuildClientProduction = [
    'node_modules/.bin/webpack --config scripts/client.production.js',
];

const commandBuildServerDevelopment = [
    'node_modules/.bin/rollup -c ./scripts/server.development.ts',
];
const commandBuildServerProduction = [
    'node_modules/.bin/rollup -c ./scripts/server.production.ts',
];

const commandBuildStills = [
    'node ./scripts/stills.js',
];


const commandStartClientDevelopment = [
    'node_modules/.bin/webpack --watch --progress --config scripts/client.development.js',
];
const commandStartServerDevelopment = [
    ...commandBuildServerDevelopment,
    'nodemon build/server.js',
];


const commandBuildDevelopment = [
    ...commandClean,
    ...commandBuildServerDevelopment,
    ...commandBuildClientDevelopment,
];
const commandBuildDevelopmentStills = [
    ...commandBuildDevelopment,
    commandBuildStills,
];

const commandBuildProduction = [
    ...commandClean,
    ...commandBuildServerProduction,
    ...commandBuildClientProduction,
];
const commandBuildProductionStills = [
    ...commandBuildProduction,
    commandBuildStills,
];



/** FUNCTIONS */
const runCommand = (
    command,
) => {
    for (const subCommand of command) {
        execSync(subCommand);
    }
}



/** COMMAND HANDLER */
switch (command) {
    case 'start':
        if (!existsSync(buildFolder)) {
            runCommand(commandBuildProductionStills);
        }
        runCommand(commandStart);
        break;
    case 'start.client.development':
        runCommand(commandStartClientDevelopment);
        break;
    case 'start.server.development':
        runCommand(commandStartServerDevelopment);
        break;
    case 'run.development':
        runCommand(commandRunDevelopment);
        break;
    case 'run.production':
        runCommand(commandRunProduction);
        break;
    case 'clean':
        runCommand(commandClean);
        break;
    case 'build.client.development':
        runCommand(commandBuildClientDevelopment);
        break;
    case 'build.client.production':
        runCommand(commandBuildClientProduction);
        break;
    case 'build.server.development':
        runCommand(commandBuildServerDevelopment);
        break;
    case 'build.server.production':
        runCommand(commandBuildServerProduction);
        break;
    case 'build.stills':
        runCommand(commandBuildStills);
        break;
    case 'build.development':
        runCommand(commandBuildDevelopment);
        break;
    case 'build.development.stills':
        runCommand(commandBuildDevelopmentStills);
        break;
    case 'build.production':
        runCommand(commandBuildProduction);
        break;
    case 'build.production.stills':
        runCommand(commandBuildProductionStills);
        break;
}



/** LEGACY */

// "start": "node build/server.js",
// "start.client.development": "webpack --watch --progress --config scripts/client.development.js",
// "start.server.development": "yarn build.server.development && nodemon build/server.js",
// "run.development": "nodemon build/server.js",
// "run.production": "node build/server.js",
// "clean": "rimraf ./build",
// "build.client.development": "webpack --config scripts/client.development.js",
// "build.client.production": "webpack --config scripts/client.production.js",
// "build.server.development": "rollup -c ./scripts/server.development.ts",
// "build.server.production": "rollup -c ./scripts/server.production.ts",
// "build.stills": "node ./scripts/stills.js",
// "build.development": "yarn clean && yarn build.server.development && yarn build.client.development",
// "build.development.stills": "yarn build.development && yarn build.stills",
// "build.production": "yarn clean && yarn build.server.production && yarn build.client.production",
// "build.production.stills": "yarn build.production && yarn build.stills",
// "deploy": "plurid deploy"
