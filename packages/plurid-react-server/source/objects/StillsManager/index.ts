import path from 'path';

import {
    existsSync,
    promises as fs,
} from 'fs';

import {
    StilledPage,
    StilledMetadataEntry,
} from '../../data/interfaces';



class StillsManager {
    private stills: Map<string, StilledPage> = new Map();

    constructor() {
        this.findStills();
    }

    public get(
        url: string
    ) {
        const still = this.stills.get(url);

        if (!still) {
            return;
        }

        return still.html;
    }

    private async findStills () {
        const stillsPath = path.join(process.cwd(), 'build/stills');

        if (!existsSync(stillsPath)) {
            return;
        }

        try {
            const stillsMetadata = path.join(stillsPath, 'metadata.json');
            const stillsMetadataFile = await fs.readFile(stillsMetadata, 'utf-8');
            const stillsMetadataJSON: StilledMetadataEntry[] | undefined = JSON.parse(stillsMetadataFile);

            if (!Array.isArray(stillsMetadataJSON)) {
                return;
            }

            for (const still of stillsMetadataJSON) {
                const stillFilePath = path.join(stillsPath, still.name);
                const stillFileData = await fs.readFile(stillFilePath, 'utf-8');
                const stillFileJSON: StilledPage | undefined = JSON.parse(stillFileData);

                if (!stillFileJSON) {
                    continue;
                }

                this.stills.set(stillFileJSON.route, stillFileJSON);
            }
        } catch (error) {
            console.log('Couldn\'t read stills.');
            return;
        }
    }
}


export default StillsManager;
