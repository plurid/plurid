import program, {
    CommanderStatic,
} from 'commander';



async function main(program: CommanderStatic) {
    program
        .version('0.1.0', '-v, --version');

    program
        .command('authenticate')
        .action(() => {
            console.log('authenticate');
        });

    program
        .command('generate')
        .action(() => {
            console.log('generate');
        });

    program
        .command('deploy')
        .action(() => {
            console.log('deploy');
        });


    program.parse(process.argv);
}


main(program);
