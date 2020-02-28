import * as inquirer from 'inquirer';

import {
    Question,
} from '../data/interfaces';



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
        'Client',
        'Server',
        new inquirer.Separator('---- pick one ----'),
    ],
    manager: [
        'Yarn',
        'NPM',
        new inquirer.Separator('---- pick one ----'),
    ],
    services: [
        'GraphQL',
        'Redux',
        'Stripe',
        new inquirer.Separator('---- select services ----'),
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
        message: 'Select services to use in the application:',
        choices: values.services,
    },
];


export default questions;
