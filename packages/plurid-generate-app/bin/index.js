#!/usr/bin/env node

const program = require('commander');

const inquire = require('../lib/index').inquire;
const processArgs = require('../lib/index').processArgs;
const questions = require('../lib/index').questions;



program
    .version('0.1.0');

if (process.argv.length === 2) {
    program
        .action(() => {
            inquire(questions);
        });
}

if (process.argv.length > 2) {
    program
        .option('-a, --app <path>', 'set the app directory')
        .option('-l, --language <language>', 'set language ("typescript" -> TypeScript || "javascript" -> JavaScript)')
        .option('-u, --ui <ui-engine>', 'set UI engine ("html" -> HTML Custom Elements || "react" -> React || "vue" -> Vue)')
        .option('-t, --type <app-type>', 'set app type ("client" -> Client-Only || "ssr" -> Server-Side Rendering)')
        .action(() => {
            processArgs(program);
        });
}

program.parse(process.argv);
