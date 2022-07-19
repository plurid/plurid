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

try {
    require('dotenv').config({
        path: environment.production
            ? './environment/.env.production'
            : environment.development
                ? './environment/.env.development'
                : './environment/.env.local',
    });
} catch (error) {
    console.log('no dotenv');
}



/** CONSTANTS */
const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

const buildFolder = path.join(process.cwd(), BUILD_DIRECTORY);
const verbose = process.env.PLURID_DEFAULT_VERBOSE === 'true' && !process.argv[3]
    ? 'inherit'
    : process.argv[3] === 'verbose'
        ? 'inherit'
        : 'ignore';


/**
 * Windows (win32) requires full path to the bin command.
 *
 * @param {string} command
 */
const crossCommand = (
    command,
) => {
    if (process.platform === 'win32') {
        return path.join(process.cwd(), 'node_modules/.bin/', command + '.cmd');
    }

    return 'node_modules/.bin/' + command;
}



/** COMMANDS */
const commandStart = [
    `node ${buildFolder}`,
];

const commandStartLocal = [
    `${crossCommand('nodemon')} --watch ${path.join(buildFolder, '/index.js')} ${buildFolder}`,
];

const commandCheck = [
    `${crossCommand('tsc')} --project ./configurations/tsconfig.check.json`,
];

const commandClean = [
    `${crossCommand('rimraf')} ${buildFolder}`,
];

const commandLint = [
    `${crossCommand('eslint')} -c ./configurations/.eslintrc.js ./source`,
];

const commandTest = [
    `${crossCommand('jest')} -c ./configurations/jest.config.js ./source`,
];

const commandLive = [
    ...commandClean,
    'mkdir -p build/client',
    'cp -r source/public/ build/client/',
    'touch build/client/vendor.js',
    `node ./scripts/live/client.js & node ./scripts/live/server.js & deon environment ./environment/.env.local.deon nodemon build/index.js`,
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
    `${crossCommand('webpack')} --config ./scripts/workings/client.development.js`,
];
const commandBuildClientProduction = [
    `${crossCommand('webpack')} --config ./scripts/workings/client.production.js`,
];

const commandBuildServerDevelopment = [
    `${crossCommand('rollup')} -c ./scripts/workings/server.development.js`,
];
const commandBuildServerProduction = [
    `${crossCommand('rollup')} -c ./scripts/workings/server.production.js`,
];

const commandBuildStills = [
    'node ./scripts/workings/stills.js',
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
    try {
        for (const subCommand of command) {
            execSync(
                subCommand,
                {
                    stdio: options.stdio,
                },
            );
        }
    } catch (error) {
        if (verbose === 'inherit') {
            console.log(error);
        }
    }
}



/** COMMAND HANDLER */
switch (command) {
    case 'start':
        if (!existsSync(buildFolder)) {
            console.log('\n\tBuild Required. Starting the Production Build Process...');
            runCommand(commandBuildProduction);
            console.log('\n\tFinished the Production Build Process.\n');
        }
        console.log('\n\tStarting the Application Server...');
        runCommand(commandStart, {
            stdio: 'inherit',
        });
        break;
    case 'start.local':
        console.log('\n\tRunning the Local Server...');
        runCommand(commandStartLocal, {
            stdio: verbose,
        });
        break;
    case 'live':
        runCommand(commandLive, {
            stdio: verbose,
        });
        break;
    case 'check':
        runCommand(commandCheck, {
            stdio: verbose,
        });
        break;
    case 'clean':
        runCommand(commandClean, {
            stdio: verbose,
        });
        break;
    case 'lint':
        runCommand(commandLint, {
            stdio: verbose,
        });
        break;
    case 'test':
        runCommand(commandTest, {
            stdio: verbose,
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
