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
                containerize,
                deployment,
            };
            await processArguments(answers);
        });
}


export default inquire;
