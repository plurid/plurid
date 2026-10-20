// #region imports
    // #region libraries
    import path from 'path';

    import {
        existsSync,
        promises as fs,
    } from 'fs';
    // #endregion libraries


    // #region external
    import {
        PluridServerOptions,
        StilledPage,
        StilledMetadataEntry,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
class StillsManager {
    private options: PluridServerOptions;
    private stills: Map<string, StilledPage> = new Map();

    constructor(
        options: PluridServerOptions,
    ) {
        this.options = options;
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

    private async findStills() {
        const {
            buildDirectory,
            stillsDirectory,
        } = this.options;

        // `resolve`: an absolute build directory stays itself; joined, it went under the working
        // directory (`<cwd>/abs/build/stills`) and no still was ever found (2026-10-20)
        const stillsPath = path.resolve(process.cwd(), buildDirectory, stillsDirectory);

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
            if (this.options.debug !== 'none' && !this.options.quiet) {
                const errorText = 'Plurid Server Error: Could not read stills.'
                if (this.options.debug === 'error') {
                    console.error(errorText, error);
                } else {
                    console.log(errorText);
                }
            }

            return;
        }
    }
}
// #endregion module



// #region exports
export default StillsManager;
// #endregion exports
