"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const values = {
    language: [
        'TypeScript',
        'JavaScript',
        new inquirer.Separator(),
    ],
    ui: [
        'HTML Custom Elements',
        'React',
        new inquirer.Separator(),
    ],
    type: [
        'Server-Side Rendered',
        'Client-Only',
        new inquirer.Separator(),
    ],
};
exports.questions = [
    {
        type: 'input',
        name: 'app',
        message: 'Enter the app directory where the application will be generated:'
    },
    {
        type: 'list',
        name: 'language',
        message: 'Choose the application language:',
        choices: values.language
    },
    {
        type: 'list',
        name: 'ui',
        message: 'Choose the user interface engine:',
        choices: values.ui
    },
    {
        type: 'list',
        name: 'type',
        message: 'Choose the application type:',
        choices: values.type
    },
];
//# sourceMappingURL=questions.js.map