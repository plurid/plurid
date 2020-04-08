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
            .option('-d, --directory <path>', 'set the application directory', 'plurid-app')
            .option('-l, --language <language>', 'set language ("typescript" -> TypeScript || "javascript" -> JavaScript)', 'typescript')
            .option('-u, --ui <ui-engine>', 'set UI engine ("html" -> HTML Custom Elements || "react" -> React || "vue" -> Vue || "angular" -> Angular)', 'react')
            .option('-r, --renderer <renderer>', 'set the application rendering side ("client" -> Client-Side Rendering || "server" -> Server-Side Rendering)', 'server')
            .option('-m, --manager <package-manager>', 'set the package manager ("npm" || "yarn")', 'yarn')
            .option('-s, --services <service-list>', 'pass additional services as a comma-separated list (graphql, redux, stripe)', 'graphql,redux,stripe')
            .option('-c, --containerize', 'use Docker to containerize the application', false)
            .option('-p, --pluridapp', 'deploy the application to plurid.app', true)
            .action(async () => {
                const {
                    directory,
                    language,
                    ui,
                    renderer,
                    manager,
                    services,
                    versioning,
                    containerize,
                    pluridapp: deployment,
                } = program;

                const answers: Answers = {
                    directory,
                    language,
                    ui,
                    renderer,
                    manager,
                    services,
                    versioning,
                    containerize,
                    deployment,
                };

                await processArguments(answers);
            });
    }

    program.parse(process.argv);
}


main(program);
