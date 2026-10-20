// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries


    // #region internal
    import {
        info,
    } from '../cli/info';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `plurid info` READS THE CONFIG (2026-10-20). It checked the conventional paths whatever the config
 * said, so an application with `publicDir: 'static'` was told its public directory was missing.
 */
describe('plurid info', () => {
    it('reports the directories the config names', async () => {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-kit-info-'));
        fs.writeFileSync(path.join(directory, 'plurid.config.js'), "module.exports = { publicDir: 'static', buildDir: 'dist' };\n");
        fs.mkdirSync(path.join(directory, 'static'));
        const written: string[] = [];
        const stdout = jest.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
            written.push(String(chunk));
            return true;
        });
        const cwd = process.cwd();
        process.chdir(directory);
        try {
            await info([]);
        } finally {
            process.chdir(cwd);
            stdout.mockRestore();
        }
        const said = written.join('');
        expect(said).toMatch(/ok\s+plurid\.config\.js/);
        expect(said).toMatch(/ok\s+static/);
        expect(said).toMatch(/--\s+dist/);
    });
});
// #endregion module
