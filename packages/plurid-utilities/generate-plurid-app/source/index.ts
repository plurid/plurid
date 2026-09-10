// #region imports
    // #region libraries
    import {
        program,
        Command,
    } from 'commander';
    // #endregion libraries


    // #region external
    import {
        Answers,
    } from './data/interfaces';
    import {
        resolveGeneratorVersion,
    } from './process/kit/versions';

    import {
        inquire,
        questions,
    } from './inquire';

    import processArguments from './process';
    // #endregion external
// #endregion imports



// #region module
/**
 * `generate-plurid-app` — no arguments: the prompts; with flags: straight to the generation.
 * One shape (the kit's, TypeScript, React): `-d <directory> [-m npm|pnpm|yarn] [-v git|none] [--no-install]`.
 */
async function main(program: Command) {
    program
        .version(resolveGeneratorVersion(), '-V, --version');

    if (process.argv.length === 2) {
        program
            .action(() => {
                console.log('\n\tGenerate a plurid application by answering the following inquiries\n');
                inquire(questions);
            });
    }

    if (process.argv.length > 2) {
        program
            .option('-d, --directory <path>', 'set the application directory', 'plurid-app')
            .option('-m, --manager <package-manager>', 'set the package manager ("npm" || "pnpm" || "yarn")', 'npm')
            .option('-v, --versioning <version-control>', 'set version control ("git" -> Git || "none" -> None)', 'none')
            .option('--no-install', 'write the files without installing the dependencies')
            // the old shape's flags are refused with a message, never silently swapped
            .option('-l, --language <language>', 'TypeScript only (the kit\'s shape)')
            .option('-u, --ui <ui-engine>', 'React only (the kit\'s shape)')
            .action(async (options) => {
                const answers: Answers & { language?: unknown; ui?: unknown } = {
                    directory: options.directory,
                    manager: options.manager,
                    versioning: options.versioning,
                    install: options.install !== false,
                    language: options.language,
                    ui: options.ui,
                };
                await processArguments(answers);
            });
    }

    program.parse(process.argv);
}

main(program);
// #endregion module
