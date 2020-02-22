"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
exports.inquire = (questions) => {
    inquirer
        .prompt(questions)
        .then(function (answers) {
        console.log('Plurid Application');
        console.log('------------------');
        console.log(answers.app);
        console.log(answers.language);
        console.log(answers.ui);
        console.log(answers.type);
    });
};
//# sourceMappingURL=inquire.js.map