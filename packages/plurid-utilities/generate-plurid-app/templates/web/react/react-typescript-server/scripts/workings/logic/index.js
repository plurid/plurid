const {
    existsSync,
} = require('node:fs');

const path = require('node:path');

const {
    execSync,
} = require('node:child_process');

const pkg = require('../../../package.json');

const {
    esModules,
    externals,
} = require('../../custom');



const loadEnvironment = (
    command = '',
) => {
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
    }

    return environment;
}


const prepare = () => {
    const command = (process.argv[2] || '').toLowerCase();

    loadEnvironment(command);

    const BUILD_DIRECTORY = process.env.PLURID_BUILD_DIRECTORY || 'build';

    const buildFolder = path.join(process.cwd(), BUILD_DIRECTORY);
    const verbose = process.env.PLURID_DEFAULT_VERBOSE === 'true' && !process.argv[3]
        ? 'inherit'
        : process.argv[3] === 'verbose'
            ? 'inherit'
            : 'ignore';

    return {
        command,
        buildFolder,
        verbose,
    };
}

const {
    command,
    buildFolder,
    verbose,
} = prepare();


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


const generateCommandsText = () => {
    const start = [
        `node ${buildFolder}`,
    ];

    const startLocal = [
        `${crossCommand('nodemon')} --watch ${path.join(buildFolder, '/index.js')} ${buildFolder}`,
    ];

    const check = [
        `${crossCommand('tsc')} --project ./configurations/tsconfig.check.json`,
    ];

    const clean = [
        `${crossCommand('rimraf')} ${buildFolder}`,
    ];

    const lint = [
        `${crossCommand('eslint')} -c ./configurations/.eslintrc.js ./source`,
    ];

    const test = [
        `${crossCommand('jest')} -c ./configurations/jest.config.js ./source`,
    ];

    const live = [
        ...clean,
        'mkdir -p build/client',
        'cp -r source/public/ build/client/',
        'touch build/client/vendor.js',
        `node ./scripts/workings/live/client.js & node ./scripts/workings/live/server.js & deon environment ./environment/.env.local.deon nodemon build/index.js`,
    ];

    const containerizeProduction = [
        ...lint,
        ...test,
        'docker build -t pluridapp -f ./configurations/production.dockerfile .',
    ];

    const containerizeProductionStills = [
        ...lint,
        ...test,
        'docker build -t pluridapp -f ./configurations/production.stills.dockerfile .',
    ];

    const buildClientDevelopment = [
        `${crossCommand('webpack')} --config ./scripts/workings/assemble/client.development.js`,
    ];
    const buildClientProduction = [
        `${crossCommand('webpack')} --config ./scripts/workings/assemble/client.production.js`,
    ];

    const buildServerDevelopment = [
        `${crossCommand('rollup')} -c ./scripts/workings/assemble/server.development.js --bundleConfigAsCjs`,
    ];
    const buildServerProduction = [
        `${crossCommand('rollup')} -c ./scripts/workings/assemble/server.production.js --bundleConfigAsCjs`,
    ];

    const buildStills = [
        'node ./scripts/workings/assemble/stills.js',
    ];


    const buildDevelopment = [
        ...clean,
        ...buildServerDevelopment,
        ...buildClientDevelopment,
    ];
    const buildDevelopmentStills = [
        ...buildDevelopment,
        ...buildStills,
    ];

    const buildProduction = [
        ...clean,
        ...lint,
        ...test,
        ...buildServerProduction,
        ...buildClientProduction,
    ];
    const buildProductionStills = [
        ...buildProduction,
        ...buildStills,
    ];


    return {
        start,
        startLocal,
        check,
        clean,
        lint,
        test,
        live,
        containerizeProduction,
        containerizeProductionStills,
        buildClientDevelopment,
        buildClientProduction,
        buildServerDevelopment,
        buildServerProduction,
        buildStills,
        buildDevelopment,
        buildDevelopmentStills,
        buildProduction,
        buildProductionStills,
    };
}


const generateCommands = () => {
    const commands = generateCommandsText();

    const start = () => {
        if (!existsSync(buildFolder)) {
            console.log('\n\tBuild Required. Starting the Production Build Process...');
            runCommand(commands.buildProduction);
            console.log('\n\tFinished the Production Build Process.\n');
        }
        console.log('\n\tStarting the Application Server...');
        runCommand(commands.start, {
            stdio: 'inherit',
        });
    }

    const startLocal = () => {
        console.log('\n\tRunning the Local Server...');
        runCommand(commands.startLocal, {
            stdio: verbose,
        });
    }

    const check = () => {
        runCommand(commands.check, {
            stdio: verbose,
        });
    }

    const clean = () => {
        runCommand(commands.clean, {
            stdio: verbose,
        });
    }

    const lint = () => {
        runCommand(commands.lint, {
            stdio: verbose,
        });
    }

    const test = () => {
        runCommand(commands.test, {
            stdio: verbose,
        });
    }

    const live = () => {
        runCommand(commands.live, {
            stdio: verbose,
        });
    }

    const containerizeProduction = () => {
        console.log('\n\tStarting the Production Containerization Process...');
        runCommand(commands.containerizeProduction, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Production Containerization Process.');
    }

    const containerizeProductionStills = () => {
        console.log('\n\tStarting the Stilled Production Containerization Process...');
        runCommand(commands.containerizeProductionStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Production Containerization Process.');
    }

    const buildClientLocal = () => {
        console.log('\n\tStarting the Client Local Build Process...');
        runCommand(commands.buildClientDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Client Local Build Process.\n');
    }

    const buildClientDevelopment = () => {
        console.log('\n\tStarting the Client Development Build Process...');
        runCommand(commands.buildClientDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Client Development Build Process.\n');
    }

    const buildClientProduction = () => {
        console.log('\n\tStarting the Client Production Build Process...');
        runCommand(commands.buildClientProduction, {
            stdio: verbose,
        });
        console.log('\n\Finished the Client Production Build Process.\n');
    }

    const buildServerLocal = () => {
        console.log('\n\tStarting the Server Local Build Process...');
        runCommand(commands.buildServerDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Server Local Build Process.\n');
    }

    const buildServerDevelopment = () => {
        console.log('\n\tStarting the Server Development Build Process...');
        runCommand(commands.buildServerDevelopment, {
            stdio: verbose,
        });
        console.log('\n\Finished the Server Development Build Process.\n');
    }

    const buildServerProduction = () => {
        console.log('\n\tStarting the Server Production Build Process...');
        runCommand(commands.buildServerProduction, {
            stdio: verbose,
        });
        console.log('\n\Finished the Server Production Build Process.\n');
    }

    const buildStills = () => {
        console.log('\n\tStarting the Stilled Build Process...');
        runCommand(commands.buildStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Build Process.\n');
    }

    const buildLocal = () => {
        console.log('\n\tStarting the Local Build Process...');
        runCommand(commands.buildDevelopment, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Local Build Process.\n');
    }

    const buildLocalStills = () => {
        console.log('\n\tStarting the Stilled Development Build Process...');
        runCommand(commands.buildDevelopmentStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Development Build Process.\n');
    }

    const buildDevelopment = () => {
        console.log('\n\tStarting the Development Build Process...');
        runCommand(commands.buildDevelopment, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Development Build Process.\n');
    }

    const buildDevelopmentStills = () => {
        console.log('\n\tStarting the Stilled Development Build Process...');
        runCommand(commands.buildDevelopmentStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Development Build Process.\n');
    }

    const buildProduction = () => {
        console.log('\n\tStarting the Production Build Process...');
        runCommand(commands.buildProduction, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Production Build Process.\n');
    }

    const buildProductionStills = () => {
        console.log('\n\tStarting the Stilled Production Build Process...');
        runCommand(commands.buildProductionStills, {
            stdio: verbose,
        });
        console.log('\n\tFinished the Stilled Production Build Process.\n');
    }


    return {
        start,
        startLocal,
        check,
        clean,
        lint,
        test,
        live,
        containerizeProduction,
        containerizeProductionStills,
        buildClientLocal,
        buildClientDevelopment,
        buildClientProduction,
        buildServerLocal,
        buildServerDevelopment,
        buildServerProduction,
        buildStills,
        buildLocal,
        buildLocalStills,
        buildDevelopment,
        buildDevelopmentStills,
        buildProduction,
        buildProductionStills,
    };
}


const resolveDependencies = (
    list,
) => {
    const names = [];

    for (const name of list) {
        if (typeof name === 'string') {
            names.push(name);
            continue;
        }

        for (const dependency of Object.keys(pkg.dependencies)) {
            const validName = name(dependency);
            if (validName) {
                names.push(validName);
            }
        }
    }

    return names;
}

const resolvedESModules = resolveDependencies(esModules);
const resolvedExternals = resolveDependencies(externals);


module.exports = {
    command,
    buildFolder,
    verbose,

    loadEnvironment,
    crossCommand,
    runCommand,

    generateCommands,

    resolvedESModules,
    resolvedExternals,
};
