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
            const answers: Answers = {
                directory: args.directory,
                manager: args.manager,
                versioning: args.versioning,
                install: args.install !== false,
            };
            await processArguments(answers);
        });
};
// #endregion module



// #region exports
export default inquire;
// #endregion exports
