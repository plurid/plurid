// #region imports
    // #region libraries
    import * as inquirer from 'inquirer';
    // #endregion libraries


    // #region external
    import {
        Question,
    } from '../data/interfaces';
    // #endregion external
// #endregion imports



// #region module
const values = {
    language: [
        'TypeScript',
        'JavaScript',
        new inquirer.Separator('---- pick one ----'),
    ],
    ui: [
        // 'HTML Custom Elements',
        'React',
        // 'Vue',
        // 'Angular',
        new inquirer.Separator('---- pick one ----'),
    ],
    renderer: [
        'Server',
        'Client',
        new inquirer.Separator('---- pick one ----'),
    ],
    manager: [
        'NPM',
        'pNPM',
        'Yarn',
        new inquirer.Separator('---- pick one ----'),
    ],
    services: [
        { name: 'Redux', value: 'Redux', checked: true },
        { name: 'Apollo', value: 'Apollo', checked: true },
        { name: 'Stripe', value: 'Stripe', checked: false },
        new inquirer.Separator('---- select services ----'),
    ],
    versioning: [
        'Git',
        'None',
        new inquirer.Separator('---- pick one ----'),
    ],
};


const questions: Question[] = [
    {
        type: 'input',
        name: 'directory',
        message: 'Enter the directory name where the application will be generated:'
    },
    {
        type: 'list',
        name: 'language',
        message: 'Choose the application language:',
        choices: values.language,
    },
    {
        type: 'list',
        name: 'ui',
        message: 'Choose the user interface engine:',
        choices: values.ui,
    },
    {
        type: 'list',
        name: 'renderer',
        message: 'Choose the application rendering side:',
        choices: values.renderer,
    },
    {
        type: 'list',
        name: 'manager',
        message: 'Choose the package manager:',
        choices: values.manager,
    },
    {
        type: 'checkbox',
        name: 'services',
        message: 'Select the services to use in the application:',
        choices: values.services,
    },
    {
        type: 'list',
        name: 'versioning',
        message: 'Select the version control system to use for the application:',
        choices: values.versioning,
    },
    {
        type: 'confirm',
        name: 'containerize',
        message: 'Containerize the application using Docker',
        default: true,
    },
    {
        type: 'confirm',
        name: 'deployment',
        message: 'Deploy the application to plurid.app',
        default: true,
    },
];
// #endregion module



// #region exports
export default questions;
// #endregion exports
