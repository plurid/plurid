// #region imports
    // #region libraries
    import inquirer from 'inquirer';
    // #endregion libraries


    // #region external
    import {
        Question,
        Answers,
    } from '~data/interfaces';

    import processArguments from '~process/index';
    // #endregion external
// #endregion imports



// #region module
const inquire = (
    questions: Question[],
) => {
    inquirer
        .prompt(questions)
        .then(async (args: any) => {
            const {
                directory,
                language,
                ui,
                renderer,
                manager,
                services,
                versioning,
                containerize,
                deployment,
            } = args;

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
// #endregion module



// #region exports
export default inquire;
// #endregion exports
