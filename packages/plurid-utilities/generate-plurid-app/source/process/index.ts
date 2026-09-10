// #region imports
    // #region external
    import {
        Answers,
        Application,
    } from '~data/interfaces';
    import {
        versioning as versioningTypes,
    } from '~data/constants';
    import {
        resolveAppDirectory,
        ensureOwnedDirectory,
    } from '~utilities/index';
    // #endregion external


    // #region internal
    import {
        normalizeAnswers,
        packageNameOf,
    } from './normalize';
    import generateKitApplication from './kit';
    // #endregion internal
// #endregion imports



// #region module
/** The answers to an application, generated; a failure is reported and the process exits nonzero. */
const processArguments = async (
    program: Partial<Answers> & { language?: unknown; ui?: unknown; renderer?: unknown },
) => {
    try {
        const answers = normalizeAnswers(program);
        const start = Date.now();
        const directory = resolveAppDirectory(answers.directory);
        ensureOwnedDirectory(directory);

        console.log('\n\tThe plurid application will be generated at:');
        console.log(`\t${directory}`);
        console.log('\tThe package manager is:', answers.manager);
        console.log(answers.versioning === versioningTypes.git
            ? '\tUsing Git for version control.'
            : '\tNot using a version control system.');
        console.log(answers.install
            ? '\tThe dependencies will be installed.'
            : '\tThe dependencies will not be installed (run the install yourself).');

        const application: Application = {
            start,
            directory,
            name: packageNameOf(directory),
            manager: answers.manager,
            versioning: answers.versioning,
            install: answers.install,
        };

        await generateKitApplication(application);
    } catch (error) {
        console.error(`\n\tCould not generate the application: ${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
};
// #endregion module



// #region exports
export default processArguments;
// #endregion exports
