import * as inquirer from 'inquirer';

import processArguments from '../process';



const inquire = (
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
            await processArguments(args);
        });
}


export default inquire;
