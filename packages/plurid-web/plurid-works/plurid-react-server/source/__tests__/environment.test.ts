// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * THE TEST ALIASES ARE ANCHORED (2026-10-20). `"utilities/(.*)"` and its siblings matched any request
 * with that segment in it, so a module of another package or of a temporary directory was looked for
 * under this package's source.
 */
describe('module resolution in the tests', () => {
    it('resolves a module outside the source to itself, whatever its path\'s segments', () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-server-modules-'));
        try {
            for (const segment of ['utilities', 'data', 'objects']) {
                fs.mkdirSync(path.join(directory, segment));
                fs.writeFileSync(path.join(directory, segment, 'probe.js'), `module.exports = '${segment} fixture';\n`);
                expect(require(path.join(directory, segment, 'probe.js'))).toBe(segment + ' fixture');
            }
        } finally {
            if (process.env.PLURID_PRESERVE_ARTIFACTS !== '1') fs.rmSync(directory, { recursive: true, force: true });
        }
    });
});


/**
 * PRODUCTION IS EITHER SWITCH (2026-10-20). The server read `ENV_MODE` only, the kit either: a host
 * running `NODE_ENV=production node build/index.js` logged every request at info level.
 */
describe('the server\'s environment', () => {
    it('takes NODE_ENV=production as production, as the kit does', () => {
        const saved = { ENV_MODE: process.env.ENV_MODE, NODE_ENV: process.env.NODE_ENV };
        delete process.env.ENV_MODE;
        process.env.NODE_ENV = 'production';
        try {
            jest.isolateModules(() => {
                const { resolveServerOptions } = require('../objects/Server/options');
                expect(resolveServerOptions({}).debug).toBe('error');
            });
        } finally {
            for (const [key, value] of Object.entries(saved)) {
                if (value === undefined) delete process.env[key];
                else process.env[key] = value;
            }
        }
    });
});
// #endregion module
