import * as inquirer from 'inquirer';
export declare const questions: ({
    type: string;
    name: string;
    message: string;
    choices?: undefined;
} | {
    type: string;
    name: string;
    message: string;
    choices: (string | inquirer.objects.Separator)[];
})[];
