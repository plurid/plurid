import program, {
    CommanderStatic,
} from 'commander';

import {
    authenticateCommand,
    generateCommand,
    deployCommand,
} from './commands';

import {
    programHasCommand,
} from './utilities';




async function main(
    program: CommanderStatic,
) {
    program
        .name('plurid')
        .usage('<command>')
        .version('0.1.0', '-v, --version');

    program
        .command('authenticate')
        .description('login or create an user account on plurid.com')
        .action(async () => {
            await authenticateCommand();
        });

    program
        .command('generate')
        .description('generate a new plurid\' application')
        .action(async () => {
            await generateCommand();
        });

    program
        .command('deploy [directory]')
        .description('deploy the plurid\' application from the current folder or from the target folder to plurid.app')
        .action(async (directory) => {
            await deployCommand(directory);
        });


    if (!programHasCommand(process.argv)) {
        program.outputHelp();
    }

    program.parseAsync(process.argv);
}


main(program);
