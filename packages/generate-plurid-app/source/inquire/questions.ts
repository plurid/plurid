import * as inquirer from 'inquirer';



const values = {
    language: [
        'TypeScript',
        // 'JavaScript',
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
        'Client-Only',
        new inquirer.Separator('---- pick one ----'),
    ],
};


interface Question {
    type: string;
    name: string;
    message: string;
    choices?: any[];
}

const questions: Question[] = [
    {
        type: 'input',
        name: 'app',
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
];


export default questions;
