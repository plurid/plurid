import path from 'path';

import {
    promises as fs,
} from 'fs'

import {
    fork,
} from 'child_process';

import detectPort from 'detect-port';

import {
    uuid,
} from '@plurid/plurid-functions';

import {
    PluridRouterPath,
} from '@plurid/plurid-data';

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
        const serverPath = path.join(process.cwd(), this.options.server);
        const buildPath = path.join(process.cwd(), this.options.build);

        const pluridServer: PluridServer = require(serverPath);
        const serverInformation = PluridServer.analysis(pluridServer);

        const serverPort = await detectPort(9900) + '';

        const child = fork(serverPath, [], {
            stdio: 'pipe',
            env: {
                PORT: serverPort,
                PLURID_OPEN: 'false',
            },
        });


        /**
         * Read the application routes.
         */
        const stillRoutes: PluridRouterPath[] = [];

        for (const path of serverInformation.paths) {
            if (!path.value.includes('/:')) {
                stillRoutes.push(path);
            }
        }

        const stillRoutesPaths = stillRoutes.map(stillRoute => stillRoute.value);

        console.info('\n\tParsed the following still routes:');

        for (const stillRoutePath of stillRoutesPaths) {
            console.info(`\t  ${stillRoutePath}`);
        }


        /**
         * Sleep 1.5 seconds to let the server spin up.
         */
        await new Promise(resolve => setTimeout(resolve, 1500));

        const startTime = Date.now();
        const estimatedDuration = 3 * serverInformation.paths.length;
        console.info(`\n\tStarting to generate stills... (this may take about ${estimatedDuration} seconds)\n`);

        const stiller = new Stiller({
            host: 'http://localhost:' + serverPort,
            routes: [
                ...stillRoutesPaths,
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

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const plural = stills.length === 1 ? '' : 's';
        console.info(`\n\tGenerated ${stills.length} still${plural} in ${duration.toFixed(2)} seconds.\n`);


        /**
         * Generate the stills as .json in the `/stills` build directory
         * so they can be loaded by the Plurid Server
         *
         * Generate a metadata.json file.
         */
        const stillsPath = path.join(buildPath, './stills');
        await fs.mkdir(
            stillsPath,
            {
                recursive: true,
            },
        );

        const metadataFile = [];

        for (const still of stills) {
            if (!still) {
                continue;
            }

            const stillName = uuid.generate() + '.json';
            const metadataItem = {
                route: still.route,
                name: stillName,
            };
            metadataFile.push(metadataItem);
            const stillJSON = JSON.stringify(still, null, 4);
            const stillFile = path.join(stillsPath, stillName);
            await fs.writeFile(stillFile, stillJSON);
        }

        const metadataFilePath = path.join(stillsPath, 'metadata.json');
        const metadataJSON = JSON.stringify(metadataFile, null, 4);
        await fs.writeFile(metadataFilePath, metadataJSON);


        /**
         * Gracefully stop the server.
         */
        child.kill(2);
    }
}


export default StillsGenerator;
