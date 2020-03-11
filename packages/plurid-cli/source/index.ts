import program, {
    CommanderStatic,
} from 'commander';



async function main(program: CommanderStatic) {
    program
        .version('0.1.0', '-v, --version');

    if (process.argv.length > 2) {

    }

    program.parse(process.argv);
}


main(program);
