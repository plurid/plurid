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
                PLURID_OPEN: 'false',
            },
        });


        // read the application

        console.log('\n\tParsed the following still routes:');

        // list the routes


        /** Sleep 1.5 seconds to let the server spin up. */
        await new Promise(resolve => setTimeout(resolve, 1500));

        const startTime = Date.now();
        const estimatedDuration = 3 * serverInformation.routing.routes.length;
        console.log(`\n\tStarting to generate stills... (this may take about ${estimatedDuration} seconds)\n`);

        const stiller = new Stiller({
            routes: [
                'http://localhost:9001/',
                'http://localhost:9001/static',
            ],
        });

        const sequence = stiller.still();
        const stills = [];
        let next;
        while (
            !(next = await sequence.next()).done
        ) {
            stills.push(next.value);
        }
        console.log(stills);


        // start a server and create server routes

        // loop the routes and generate stills
        console.log('\n\tGenerated still for route <route>');

        // generate the stills as .json so they can be loaded by the Plurid Server

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const plural = stills.length === 1 ? '' : 's';
        console.log(`\n\tGenerated ${stills.length} still${plural} in ${duration} seconds.`);

        /** Gracefully stop the server. */
        child.kill(2);
    }
}


export default StillsGenerator;
