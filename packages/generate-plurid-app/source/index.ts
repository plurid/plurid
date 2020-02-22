import program, {
    CommanderStatic,
} from 'commander';

import {
    inquire,
    questions,
} from './inquire';

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
            .option('-a, --app <path>', 'set the app directory')
            .option('-l, --language <language>', 'set language ("typescript" -> TypeScript || "javascript" -> JavaScript)')
            .option('-u, --ui <ui-engine>', 'set UI engine ("html" -> HTML Custom Elements || "react" -> React || "vue" -> Vue)')
            .option('-t, --type <app-type>', 'set app type ("client" -> Client-Only || "ssr" -> Server-Side Rendering)')
            .action(async () => {
                await processArguments(program);
            });
    }

    program.parse(process.argv);
}


main(program);
