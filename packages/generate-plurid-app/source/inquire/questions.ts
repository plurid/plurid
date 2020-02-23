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
        new inquirer.Separator('---- pick one ----'),
    ],
    type: [
        // 'Server-Side Rendered',
        'Client-Side',
        new inquirer.Separator('---- pick one ----'),
    ],
    manager: [
        'npm',
        'yarn',
        new inquirer.Separator('---- pick one ----'),
    ],
};


const questions: Question[] = [
    {
        type: 'input',
        name: 'directory',
        message: 'Enter the directory path where the application will be generated:'
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
        name: 'type',
        message: 'Choose the application type:',
        choices: values.type,
    },
    {
        type: 'list',
        name: 'type',
        message: 'Choose the package manager:',
        choices: values.manager,
    },
];


export default questions;
