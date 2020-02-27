import program, {
    CommanderStatic,
} from 'commander';

import {
    inquire,
    questions,
} from './inquire';

import {
    Answers,
} from './data/interfaces';

import processArguments from './process';



async function main(program: CommanderStatic) {
    program
        .version('0.1.0', '-v, --version');

    if (process.argv.length === 2) {
        program
            .action(() => {
                inquire(questions);
            });
    }

    if (process.argv.length > 2) {
        program
            .option('-d, --directory <path>', 'set the application directory')
            .option('-l, --language <language>', 'set language ("typescript" -> TypeScript || "javascript" -> JavaScript)')
            .option('-u, --ui <ui-engine>', 'set UI engine ("html" -> HTML Custom Elements || "react" -> React || "vue" -> Vue || "angular" -> Angular)')
            .option('-r, --renderer <renderer>', 'set the application rendering side ("client" -> Client-Side Rendering || "server" -> Server-Side Rendering)')
            .option('-m, --manager <package-manager>', 'set the package manager ("npm" || "yarn")')
            .action(async () => {
                const {
                    directory,
                    language,
                    ui,
                    renderer,
                    manager,
                    addons,
                } = program;

                const answers: Answers = {
                    directory,
                    language,
                    ui,
                    renderer,
                    manager,
                    addons,
                };

                await processArguments(answers);
            });
    }

    program.parse(process.argv);
}


main(program);
