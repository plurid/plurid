import program, {
    CommanderStatic,
} from 'commander';



async function main(
    program: CommanderStatic,
) {
    program
        .name('plurid')
        .usage('<command>')
        .version('0.1.0', '-v, --version');

    program
        .command('')
        .action(async () => {
            console.log('Run a command: authenticate, generate, deploy.');
        });

    program
        .command('authenticate')
        .description('login or create an user account on plurid.com')
        .action(async () => {
            console.log('authenticate');
        });

    program
        .command('generate')
        .description('generate a new plurid\' application')
        .action(async () => {
            console.log('generate');
        });

    program
        .command('deploy [directory]')
        .description('deploy the plurid\' application from the current folder or from the target folder to plurid.app')
        .action(async (directory) => {
            console.log('deploy');
            console.log(directory);
        });


    if (!process.argv.slice(2).length) {
        program.outputHelp();
    }

    program.parseAsync(process.argv);
}


main(program);
