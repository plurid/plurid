const path = require('path');

const {
    existsSync,
} = require('fs');

const {
    execSync,
} = require('child_process');



const command = process.argv[2];


/** ENVIRONMENT */
const environment = {
    production: command.includes('production'),
    development: command.includes('development'),
    local: !command.includes('development') && !command.includes('production'),
};

require('dotenv').config({
    path: environment.production
        ? './environment/.env.production'
        : environment.development
            ? './environment/.env.development'
            : './environment/.env.local',
});



/** CONSTANTS */
const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

const buildFolder = path.join(process.cwd(), BUILD_DIRECTORY);
const verbose = process.env.PLURID_DEFAULT_VERBOSE === 'true' && !process.argv[3]
    ? 'inherit'
    : process.argv[3] === 'verbose'
        ? 'inherit'
        : 'ignore';



/** COMMANDS */
const commandStart = [
    `node ${BUILD_DIRECTORY}`,
];

const commandRunDevelopment = [
    `nodemon ${BUILD_DIRECTORY}`,
];
const commandRunProduction = [
    `node ${BUILD_DIRECTORY}`,
];

const commandClean = [
    `rimraf ./${BUILD_DIRECTORY}`,
];

const commandLint = [
    'eslint -c ./configurations/.eslintrc.js ./source',
];

const commandTest = [
    'jest -c ./configurations/jest.config.js ./source',
];

const commandContainerizeProduction = [
    ...commandLint,
    ...commandTest,
    'docker build -t pluridapp -f ./configurations/production.dockerfile .',
];

const commandContainerizeProductionStills = [
    ...commandLint,
    ...commandTest,
    'docker build -t pluridapp -f ./configurations/production.stills.dockerfile .',
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
    `nodemon ${BUILD_DIRECTORY}`,
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
    ...commandLint,
    ...commandTest,
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
            console.log('\n\tFinished the Stilled Production Build Process.\n');
        }
        console.log('\n\tStarting the Application Server...');
        runCommand(commandStart, {
            stdio: 'inherit',
        });
        break;
    case 'start.client.development':
        console.log('\n\tStarting the Client Development Process...');
        runCommand(commandStartClientDevelopment, {
            stdio: verbose,
        });
        break;
    case 'start.server.development':
        console.log('\n\tStarting the Server Development Process...');
        runCommand(commandStartServerDevelopment, {
            stdio: verbose,
        });
        break;
    case 'run.development':
        console.log('\n\tRunning the Development Server...');
        runCommand(commandRunDevelopment, {
            stdio: verbose,
        });
        break;
    case 'run.production':
        console.log('\n\tRunning the Production Server...');
        runCommand(commandRunProduction, {
            stdio: 'inherit',
        });
        break;
    case 'clean':
        runCommand(commandClean);
        break;
    case 'lint':
        runCommand(commandLint, {
            stdio: 'inherit',
        });
        break;
    case 'test':
        runCommand(commandTest, {
            stdio: 'inherit',
        });
        break;
    case 'containerize.production':
        console.log('\n\tStarting the Production Containerization Process...');
        runCommand(commandContainerizeProduction, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Production Containerization Process.');
        break;
    case 'containerize.production.stills':
        console.log('\n\tStarting the Stilled Production Containerization Process...');
        runCommand(commandContainerizeProductionStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Production Containerization Process.');
        break;
    case 'build.client.local':
        console.log('\n\tStarting the Client Local Build Process...');
        runCommand(commandBuildClientDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Client Local Build Process.\n');
        break;
    case 'build.client.development':
        console.log('\n\tStarting the Client Development Build Process...');
        runCommand(commandBuildClientDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Client Development Build Process.\n');
        break;
    case 'build.client.production':
        console.log('\n\tStarting the Client Production Build Process...');
        runCommand(commandBuildClientProduction, {
            stdio: verbose,
        });
        console.log('\n\Finished the Client Production Build Process.\n');
        break;
    case 'build.server.local':
        console.log('\n\tStarting the Server Local Build Process...');
        runCommand(commandBuildServerDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Server Local Build Process.\n');
        break;
    case 'build.server.development':
        console.log('\n\tStarting the Server Development Build Process...');
        runCommand(commandBuildServerDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Server Development Build Process.\n');
        break;
    case 'build.server.production':
        console.log('\n\tStarting the Server Production Build Process...');
        runCommand(commandBuildServerProduction, {
            stdio: verbose,
        });
        console.log('\n\Finished the Server Production Build Process.\n');
        break;
    case 'build.stills':
        console.log('\n\tStarting the Stilled Build Process...');
        runCommand(commandBuildStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Build Process.\n');
        break;
    case 'build.local':
        console.log('\n\tStarting the Local Build Process...');
        runCommand(commandBuildDevelopment, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Local Build Process.\n');
        break;
    case 'build.local.stills':
        console.log('\n\tStarting the Stilled Development Build Process...');
        runCommand(commandBuildDevelopmentStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Development Build Process.\n');
        break;
    case 'build.development':
        console.log('\n\tStarting the Development Build Process...');
        runCommand(commandBuildDevelopment, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Development Build Process.\n');
        break;
    case 'build.development.stills':
        console.log('\n\tStarting the Stilled Development Build Process...');
        runCommand(commandBuildDevelopmentStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Development Build Process.\n');
        break;
    case 'build.production':
        console.log('\n\tStarting the Production Build Process...');
        runCommand(commandBuildProduction, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Production Build Process.\n');
        break;
    case 'build.production.stills':
        console.log('\n\tStarting the Stilled Production Build Process...');
        runCommand(commandBuildProductionStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Production Build Process.\n');
        break;
}
