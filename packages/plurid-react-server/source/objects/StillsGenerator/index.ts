import path from 'path';

import {
    StillsGeneratorOptions,
} from '../../data/interfaces';

import Stiller from '../Stiller';



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
        // console.log('serverSourcePath', serverSourcePath);
        // console.log('serverBuildPath', serverBuildPath);
        // console.log('buildDirectoryPath', buildDirectoryPath);

        console.log('\n\tStarting to generate stills... (this may take a while)');

        // read the application

        console.log('\n\tParsed the following still routes:');

        // list the routes


        // start a server and create server routes

        // loop the routes and generate stills
        console.log('\n\tGenerated still for route <route>');

        // generate the stills as .json so they can be loaded by the Plurid Server
    }
}


export default StillsGenerator;
