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
    'node_modules/.bin/webpack --config ./scripts/workings/client.development.js',
];
const commandBuildClientProduction = [
    'node_modules/.bin/webpack --config ./scripts/workings/client.production.js',
];

const commandBuildServerDevelopment = [
    'node_modules/.bin/rollup -c ./scripts/workings/server.development.js',
];
const commandBuildServerProduction = [
    'node_modules/.bin/rollup -c ./scripts/workings/server.production.js',
];

const commandBuildStills = [
    'node ./scripts/workings/stills.js',
];


const commandStartClientDevelopment = [
    'node_modules/.bin/webpack --watch --progress --config ./scripts/workings/client.development.js',
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
    ...commandBuildStills,
];

const commandBuildProduction = [
    ...commandClean,
    ...commandBuildServerProduction,
    ...commandBuildClientProduction,
];
const commandBuildProductionStills = [
    ...commandBuildProduction,
    ...commandBuildStills,
];



/** FUNCTIONS */
const runCommand = (
    command,
) => {
    for (const subCommand of command) {
        execSync(subCommand, {
            stdio: 'inherit',
        });
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
