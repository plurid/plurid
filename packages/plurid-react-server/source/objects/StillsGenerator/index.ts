import path from 'path';

import typescript from "typescript";

import {
    StillsGeneratorOptions,
} from '../../data/interfaces';



class StillsGenerator {
    private options: StillsGeneratorOptions;

    constructor(
        options?: Partial<StillsGeneratorOptions>,
    ) {
        this.options = this.resolveOptions(options);
    }

    resolveOptions(
        options?: Partial<StillsGeneratorOptions>,
    ) {
        const stillsGeneratorOptions: StillsGeneratorOptions = {
            serverSource: options?.serverSource ?? './source/server/index.ts',
            serverBuild: options?.serverBuild ?? './build/server.js',
            buildDirectory: options?.buildDirectory ?? './build/',
        };

        return stillsGeneratorOptions;
    }

    async initialize() {
        const serverSourcePath = path.resolve(process.cwd(), this.options.serverSource);
        const serverBuildPath = path.resolve(process.cwd(), this.options.serverBuild);
        const buildDirectoryPath = path.resolve(process.cwd(), this.options.buildDirectory);
        console.log('serverSourcePath', serverSourcePath);
        console.log('serverBuildPath', serverBuildPath);
        console.log('buildDirectoryPath', buildDirectoryPath);

        const program = typescript.createProgram([serverSourcePath], {});
    }
}


export default StillsGenerator;
