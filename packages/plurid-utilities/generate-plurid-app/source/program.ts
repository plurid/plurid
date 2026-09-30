// #region imports
    // #region libraries
    import {
        Command,
    } from 'commander';
    // #endregion libraries


    // #region external
    import {
        Answers,
    } from './data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface GeneratorActions {
    /** No arguments: the prompts. */
    prompt: () => void | Promise<void>;
    /** Arguments: straight to the generation. */
    generate: (answers: Answers & { language?: unknown; ui?: unknown }) => Promise<void>;
}


export const DEFAULT_DIRECTORY = 'plurid-app';

const EXAMPLES = `
Run with no arguments for the prompts.

Examples:
  $ npx @plurid/generate-plurid-app                     the prompts
  $ npx @plurid/generate-plurid-app my-site             ./my-site, npm, installed
  $ npx @plurid/generate-plurid-app my-site -m pnpm -v git --no-install
`;


/**
 * The command line: `generate-plurid-app [directory] [-d <directory>] [-m npm|pnpm|yarn]
 * [-v git|none] [--no-install]`. The directory may be given as the argument: without `.argument()`
 * commander accepted `my-site` and dropped it, and the application went to `./plurid-app`
 * (2026-09-29); an argument more is an error now, not ignored.
 */
export const createProgram = (
    actions: GeneratorActions,
    version: string,
): Command => {
    const program = new Command();

    program
        .name('generate-plurid-app')
        .description('Generate a plurid application — the shape @plurid/plurid-kit runs (TypeScript, React).')
        .version(version, '-V, --version')
        .argument('[directory]', `where to write (empty or new); the same as -d (default "${DEFAULT_DIRECTORY}")`)
        .option('-d, --directory <path>', `set the application directory (default "${DEFAULT_DIRECTORY}")`)
        .option('-m, --manager <package-manager>', 'set the package manager ("npm" || "pnpm" || "yarn")', 'npm')
        .option('-v, --versioning <version-control>', 'set version control ("git" -> Git || "none" -> None)', 'none')
        .option('--no-install', 'write the files without installing the dependencies')
        // the old shape's flags are refused with a message, never silently swapped
        .option('-l, --language <language>', 'TypeScript only (the kit\'s shape)')
        .option('-u, --ui <ui-engine>', 'React only (the kit\'s shape)')
        .allowExcessArguments(false)
        .addHelpText('after', EXAMPLES)
        .action(async (directoryArgument: string | undefined, options) => {
            if (
                directoryArgument
                && options.directory
                && directoryArgument !== options.directory
            ) {
                program.error(
                    `Two directories were given ("${directoryArgument}" and -d "${options.directory}"); give one.`,
                );
            }

            await actions.generate({
                directory: directoryArgument || options.directory || DEFAULT_DIRECTORY,
                manager: options.manager,
                versioning: options.versioning,
                install: options.install !== false,
                language: options.language,
                ui: options.ui,
            });
        });

    return program;
};


/**
 * `generate-plurid-app` run with `argv`: no arguments, the prompts; arguments, the command line.
 * Imported without a command line of its own (a `node -e` import: `argv` has no script), it does nothing.
 */
export const runGenerator = async (
    argv: string[],
    actions: GeneratorActions,
    version: string,
): Promise<void> => {
    if (argv.length === 2) {
        await actions.prompt();
        return;
    }

    if (argv.length > 2) {
        await createProgram(actions, version).parseAsync(argv);
    }
};
// #endregion module
