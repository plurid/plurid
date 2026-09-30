// #region imports
    // #region external
    import {
        resolveGeneratorVersion,
    } from './process/kit/versions';

    import {
        inquire,
        questions,
    } from './inquire';

    import processArguments from './process';

    import {
        runGenerator,
    } from './program';
    // #endregion external
// #endregion imports



// #region module
/**
 * `generate-plurid-app` — no arguments: the prompts; with a directory or flags: straight to the
 * generation. One shape (the kit's, TypeScript, React):
 * `[directory] [-d <directory>] [-m npm|pnpm|yarn] [-v git|none] [--no-install]`.
 */
runGenerator(
    process.argv,
    {
        prompt: () => {
            console.log('\n\tGenerate a plurid application by answering the following inquiries\n');
            inquire(questions);
        },
        generate: (answers) => processArguments(answers),
    },
    resolveGeneratorVersion(),
).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
// #endregion module
