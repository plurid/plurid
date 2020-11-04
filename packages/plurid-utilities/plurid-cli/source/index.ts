import program, {
    CommanderStatic,
} from 'commander';

import {
    authenticateCommand,
    generateCommand,
    deployCommand,
    statusCommand,
    logoutCommand,
} from './commands';

// import {
//     programHasCommand,
// } from './services/utilities';



async function main(
    program: CommanderStatic,
) {
    program
        .name('plurid')
        .usage('<command>')
        .version('0.1.0', '-v, --version');

    program
        .command('status')
        .description('command-line interface application state')
        .action(async () => {
            await statusCommand();
        });

    program
        .command('authenticate')
        .description('login or create an user account on plurid.com')
        .action(async () => {
            await authenticateCommand();
        });

    program
        .command('generate')
        .option('-o, --online', 'use generator from online registry')
        .description('generate a new plurid\' application')
        .action(async (commandObject) => {
            const options = {
                online: commandObject.online,
            };
            await generateCommand(options);
        });

    program
        .command('deploy [directory]')
        .description('deploy the plurid\' application from the current folder or from the target folder to plurid.app')
        .action(async (directory) => {
            await deployCommand(directory);
        });

    program
        .command('logout')
        .description('logout from the current user')
        .action(async () => {
            await logoutCommand();
        });


    // if (!programHasCommand(process.argv)) {
    //     program.outputHelp();
    // }

    program.parseAsync(process.argv);
}


main(program);
