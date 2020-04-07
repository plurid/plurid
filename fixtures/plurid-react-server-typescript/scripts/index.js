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
    options = {
        stdio: 'ignore'
    },
) => {
    for (const subCommand of command) {
        execSync(
            subCommand,
            {
                stdio: options.stdio,
            },
        );
    }
}



/** COMMAND HANDLER */
switch (command) {
    case 'start':
        if (!existsSync(buildFolder)) {
            console.log('\n\tBuild Required. Starting the Stilled Production Build Process...');
            runCommand(commandBuildProductionStills);
        }
        console.log('\n\tStarting the Application Server...');
        runCommand(commandStart);
        break;
    case 'start.client.development':
        console.log('\n\tStarting the Client Development Process...');
        runCommand(commandStartClientDevelopment);
        break;
    case 'start.server.development':
        console.log('\n\tStarting the Server Development Process...');
        runCommand(commandStartServerDevelopment);
        break;
    case 'run.development':
        console.log('\n\tRunning the Development Server...');
        runCommand(commandRunDevelopment);
        break;
    case 'run.production':
        console.log('\n\tRunning the Production Server...');
        runCommand(commandRunProduction);
        break;
    case 'clean':
        runCommand(commandClean);
        break;
    case 'build.client.development':
        console.log('\n\tStarting the Client Development Build...');
        runCommand(commandBuildClientDevelopment);
        console.log('\n\Finished the Client Development Build.\n');
        break;
    case 'build.client.production':
        console.log('\n\tStarting the Client Production Build...');
        runCommand(commandBuildClientProduction);
        console.log('\n\Finished the Client Production Build.\n');
        break;
    case 'build.server.development':
        console.log('\n\tStarting the Server Development Build...');
        runCommand(commandBuildServerDevelopment);
        console.log('\n\Finished the Server Development Build.\n');
        break;
    case 'build.server.production':
        console.log('\n\tStarting the Server Production Build...');
        runCommand(commandBuildServerProduction);
        console.log('\n\Finished the Server Production Build.\n');
        break;
    case 'build.stills':
        runCommand(commandBuildStills, {
            stdio: 'inherit',
        });
        break;
    case 'build.development':
        console.log('\n\tStarting the Development Build...');
        runCommand(commandBuildDevelopment);
        console.log('\n\tFinished the Development Build.\n');
        break;
    case 'build.development.stills':
        console.log('\n\tStarting the Stilled Development Build...');
        runCommand(commandBuildDevelopmentStills);
        console.log('\n\tFinished the Stilled Development Build.\n');
        break;
    case 'build.production':
        console.log('\n\tStarting the Production Build...');
        runCommand(commandBuildProduction);
        console.log('\n\tFinished the Production Build.\n');
        break;
    case 'build.production.stills':
        console.log('\n\tStarting the Stilled Production Build...');
        runCommand(commandBuildProductionStills);
        console.log('\n\tFinished the Stilled Production Build.\n');
        break;
}
