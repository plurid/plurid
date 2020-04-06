import path from 'path';

import {
    fork,
} from 'child_process';

import {
    StillsGeneratorOptions,
} from '../../data/interfaces';

import Stiller from '../Stiller';
import PluridServer from '../Server';



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
            server: options?.server ?? './build/server.js',
            build: options?.build ?? './build/',
        };

        return stillsGeneratorOptions;
    }

    async initialize() {
        const serverPath = path.resolve(process.cwd(), this.options.server);
        const buildPath = path.resolve(process.cwd(), this.options.build);

        const pluridServer: PluridServer<any> = require(serverPath);
        const serverInformation = PluridServer.analysis(pluridServer);

        const child = fork(serverPath, [], {
            stdio: 'pipe',
            env: {
                PORT: '9001',
            },
        });

        /** Sleep 1.5 seconds to let the server spin up. */
        await new Promise(resolve => setTimeout(resolve, 1500));


        console.log('\n\tStarting to generate stills... (this may take a while)');

        const stiller = new Stiller({
            routes: [
                'http://localhost:9001/',
                'http://localhost:9001/static',
            ],
        });

        const sequence = stiller.still();
        const values = [];
        let next;
        while (
            !(next = await sequence.next()).done
        ) {
            values.push(next.value);
        }
        console.log(values);




        // read the application

        console.log('\n\tParsed the following still routes:');

        // list the routes


        // start a server and create server routes

        // loop the routes and generate stills
        console.log('\n\tGenerated still for route <route>');

        // generate the stills as .json so they can be loaded by the Plurid Server

        child.kill(2);
    }
}


export default StillsGenerator;
