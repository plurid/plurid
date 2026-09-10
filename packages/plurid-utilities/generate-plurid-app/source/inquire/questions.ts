// #region imports
    // #region libraries
    import inquirer from 'inquirer';
    // #endregion libraries


    // #region external
    import {
        Question,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const values = {
    manager: [
        'NPM',
        'pNPM',
        'Yarn',
        new inquirer.Separator('---- pick one ----'),
    ],
    versioning: [
        'Git',
        'None',
        new inquirer.Separator('---- pick one ----'),
    ],
};

/** The kit's shape is the one shape (TypeScript, React, the kit's server and client): four answers. */
const questions: Question[] = [
    {
        type: 'input',
        name: 'directory',
        message: 'Enter the directory name where the application will be generated:',
        default: 'plurid-app',
    },
    {
        type: 'list',
        name: 'manager',
        message: 'Choose the package manager:',
        choices: values.manager,
    },
    {
        type: 'list',
        name: 'versioning',
        message: 'Select the version control system to use for the application:',
        choices: values.versioning,
    },
    {
        type: 'confirm',
        name: 'install',
        message: 'Install the dependencies now',
        default: true,
    },
];
// #endregion module



// #region exports
export default questions;
// #endregion exports
