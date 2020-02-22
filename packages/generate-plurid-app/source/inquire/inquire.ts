import * as inquirer from 'inquirer';

import {
    processArgs,
} from './processArgs';


export const inquire = (
    questions: any,
) => {
    inquirer
        .prompt(questions)
        .then(async (answers: any) => {
            const {
                app,
                language,
                ui,
                type,
            } = answers;

            const args = {
                app,
                language,
                ui,
                type,
            };
            await processArgs(args);
        });
}
