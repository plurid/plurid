import * as inquirer from 'inquirer';

import processArguments from '../process';

import {
    Question,
    Answers,
} from '../data/interfaces';



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
                pluridApp,
            } = args;

            const answers: Answers = {
                directory,
                language,
                ui,
                renderer,
                manager,
                services,
                pluridApp,
            };
            await processArguments(answers);
        });
}


export default inquire;
