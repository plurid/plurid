import program, {
    CommanderStatic,
} from 'commander';



async function main(program: CommanderStatic) {
    program
        .version('0.1.0', '-v, --version');

    program
        .command('authenticate')
        .description('login or create account on plurid.com')
        .action(() => {
            console.log('authenticate');
        });

    program
        .command('generate')
        .description('generate a plurid\' application')
        .action(() => {
            console.log('generate');
        });

    program
        .command('deploy [directory]')
        .description('deploy the plurid\' application from the current folder or from the target folder to plurid.app')
        .action((directory) => {
            console.log('deploy');
            console.log(directory);
        });


    program.parse(process.argv);
}


main(program);
