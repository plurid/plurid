"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquire_1 = require("./inquire");
function main(program) {
    return __awaiter(this, void 0, void 0, function* () {
        program
            .version('0.1.0', '-v, --version');
        if (process.argv.length === 2) {
            program
                .action(() => {
                inquire_1.inquire(inquire_1.questions);
            });
        }
        if (process.argv.length > 2) {
            program
                .option('-a, --app <path>', 'set the app directory')
                .option('-l, --language <language>', 'set language ("typescript" -> TypeScript || "javascript" -> JavaScript)')
                .option('-u, --ui <ui-engine>', 'set UI engine ("html" -> HTML Custom Elements || "react" -> React || "vue" -> Vue)')
                .option('-t, --type <app-type>', 'set app type ("client" -> Client-Only || "ssr" -> Server-Side Rendering)')
                .action(() => {
                inquire_1.processArgs(program);
            });
        }
        program.parse(process.argv);
    });
}
main(commander_1.default);
//# sourceMappingURL=index.js.map