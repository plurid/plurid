// #region imports
    // #region libraries
    import fs from 'fs';
    import path from 'path';

    import dotenv from 'dotenv';
    // #endregion libraries
// #endregion imports



// #region module
/** denote's stock dev port; the default when neither `--port` nor `PORT` is set. */
export const DEFAULT_DEV_PORT = '33721';


/**
 * Load the environment files for a mode. The MOST SPECIFIC file wins:
 *   .env.<mode>.local  >  .env.<mode>  >  .env.local  >  .env
 * each read from the application's root, then from `environment/` (plurid apps keep their `.env.*`
 * there), and a variable already set in the environment (the shell, the container) wins over every
 * file. dotenv never overwrites a key already set, so the files are read most specific first — they
 * were read least specific first, and `.env` beat `.env.production` (2026-09-29).
 */
export function loadEnvironment(
    mode: string,
    directory: string = process.cwd(),
): string[] {
    const candidates = [
        `.env.${mode}.local`,
        `.env.${mode}`,
        '.env.local',
        '.env',
    ];

    const folders = ['.', 'environment'];

    const loaded: string[] = [];
    for (const candidate of candidates) {
        for (const folder of folders) {
            const file = path.resolve(directory, folder, candidate);
            if (fs.existsSync(file)) {
                dotenv.config({ path: file });
                loaded.push(file);
            }
        }
    }
    return loaded;
}
// #endregion module
