// #region imports
    // #region external
    import {
        Answers,
        Application,
    } from '~data/interfaces';

    import {
        ui as uiTypes,
        versioning as versioningTypes,
    } from '~data/constants';

    import {
        resolveAppDirectory,
        ensureOwnedDirectory,
    } from '~utilities/index';
    import {
        normalizeAnswers,
    } from './normalize';
    // #endregion external


    // #region internal
    import generateReactApp from './react';
    // #endregion internal
// #endregion imports



// #region module
const generateApplication = async (
    app: Application,
) => {
    switch (app.ui) {
        case uiTypes.react:
            return await generateReactApp(app);
    }
}


const processArguments = async (
    program: Answers,
) => {
    try {
        const answers = normalizeAnswers(program);
        const start = Date.now();

        const directory = resolveAppDirectory(answers.directory);
        ensureOwnedDirectory(directory);

        const {
            language,
            ui,
            renderer,
            manager,
            services,
            versioning,
            containerize,
            deployment,
        } = answers;

        console.log('\n\tThe plurid\' application will be generated at:');
        console.log(`\t${directory}`);
        console.log('\tThe application language is:', language);
        console.log('\tThe application is based on:', ui);
        console.log('\tThe application rendering side is:', renderer);
        console.log('\tThe package manager is:', manager);

        if (services.length > 0) {
            const plural = services.length === 1 ? '' : 's';
            const verb = services.length === 1 ? 'is' : 'are';
            console.log(`\tThe selected service${plural} ${verb}: ${services.join(', ')}.`);
        } else {
            console.log('\tNo selected services.');
        }

        console.log(versioning === versioningTypes.git
            ? '\tUsing Git for version control.'
            : '\tNot using a version control system.');
        console.log(containerize
            ? '\tUsing Docker to containerize the application.'
            : '\tNot using Docker to containerize the application.');
        console.log(deployment
            ? '\tDeploying the application to plurid.app.'
            : '\tNot deploying the application to plurid.app.');

        const application: Application = {
            start,
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

        await generateApplication(application);
    } catch (error) {
        // the cause is shown and the exit status is visible to automation (C11 / C12)
        console.error(`\n\tCould not generate the application: ${error instanceof Error ? error.message : String(error)}\n`);
        process.exitCode = 1;
    }
}
// #endregion module



// #region exports
export default processArguments;
// #endregion exports
