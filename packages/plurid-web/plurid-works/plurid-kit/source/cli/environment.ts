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
 * Load environment files for a mode, in increasing precedence (later wins):
 *   .env  ->  .env.local  ->  .env.<mode>  ->  .env.<mode>.local
 * plus an `environment/` variant of each (plurid apps keep `.env.*` under
 * `environment/`). Existing `process.env` values are never overwritten.
 */
export function loadEnvironment(
    mode: string,
): void {
    const candidates = [
        '.env',
        '.env.local',
        `.env.${mode}`,
        `.env.${mode}.local`,
    ];

    const directories = ['.', 'environment'];

    for (const directory of directories) {
        for (const candidate of candidates) {
            const file = path.resolve(process.cwd(), directory, candidate);
            if (fs.existsSync(file)) {
                dotenv.config({ path: file });
            }
        }
    }
}
// #endregion module
