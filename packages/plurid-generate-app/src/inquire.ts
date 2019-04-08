import * as inquirer from 'inquirer';


export const inquire = (questions: any) => {
    inquirer
        .prompt(questions)
        .then(function (answers: any) {
            console.log('Plurid Application');
            console.log('------------------');
            console.log(answers.app);
            console.log(answers.language);
            console.log(answers.ui);
            console.log(answers.type);
        });
}
