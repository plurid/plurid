/**
 * The stills generator against a real forked server (a stand-in built server: it exports the server's
 * `routes` / `options` for the generator to read, and serves its pages when run as the main module)
 * and a Puppeteer stand-in that fetches. What the forked server sees of the environment, which routes
 * are stilled, and what is written — without a browser.
 */

// #region imports
    // #region libraries
    import fs from 'fs';
    import os from 'os';
    import path from 'path';
    // #endregion libraries
// #endregion imports



// #region module
const SERVER = `
const http = require('http');
const server = {
    routes: [{ value: '/' }, { value: '/about' }, { value: '/items/:id' }, { value: '/skipped' }],
    options: { stiller: { waitUntil: 'load', timeout: 5000, ignore: ['/skipped'] } },
};
module.exports = server;
if (require.main === module) {
    http.createServer((request, response) => {
        response.setHeader('content-type', 'text/html');
        response.end('<html><body>' + request.url
            + ' secret=' + process.env.PLURID_STILLS_TEST_SECRET
            + ' path=' + (process.env.PATH ? 'kept' : 'dropped')
            + '</body></html>');
    }).listen(Number(process.env.PORT));
    process.on('SIGTERM', () => process.exit(0));
}
`;

/** A Puppeteer that "renders" by fetching: the status and the body the server answered. */
const fetchingPuppeteer = {
    launch: async () => ({
        newPage: async () => {
            let body = '';
            return {
                goto: async (url: string) => {
                    const response = await fetch(url);
                    body = await response.text();
                    return { status: () => response.status };
                },
                content: async () => body,
                close: async () => undefined,
            };
        },
        close: async () => undefined,
    }),
};


describe('PluridStillsGenerator (2026-09-29)', () => {
    let directory: string;
    let log: jest.SpyInstance;

    beforeEach(() => {
        directory = fs.mkdtempSync(path.join(os.tmpdir(), 'plurid-stills-'));
        log = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    });

    afterEach(() => {
        log.mockRestore();
        if (process.env.PLURID_PRESERVE_ARTIFACTS !== '1') fs.rmSync(directory, { recursive: true, force: true });
        jest.resetModules();
        jest.dontMock('puppeteer');
        delete process.env.PLURID_STILLS_TEST_SECRET;
    });

    it('stills every static route through a forked server that keeps the environment (PATH, secrets)', async () => {
        jest.doMock('puppeteer', () => fetchingPuppeteer);
        const { default: StillsGenerator } = require('../');

        const server = path.join(directory, 'server.js');
        fs.writeFileSync(server, SERVER);
        process.env.PLURID_STILLS_TEST_SECRET = 'kept';

        await new StillsGenerator({ server, build: path.join(directory, 'build') }).initialize();

        const stills = path.join(directory, 'build', 'stills');
        const metadata = JSON.parse(fs.readFileSync(path.join(stills, 'metadata.json'), 'utf8'));
        expect(metadata.map((entry: { route: string }) => entry.route)).toEqual(['/', '/about']);
        for (const entry of metadata) {
            const still = JSON.parse(fs.readFileSync(path.join(stills, entry.name), 'utf8'));
            expect(still.html).toContain(`${entry.route} secret=kept path=kept`);
        }
    });

    it('a built file that does not export its server is named for what it is (a self-starting kit entry exports nothing)', async () => {
        jest.doMock('puppeteer', () => fetchingPuppeteer);
        const { default: StillsGenerator } = require('../');

        const server = path.join(directory, 'index.js');
        fs.writeFileSync(server, 'module.exports = {};');

        await expect(new StillsGenerator({ server, build: directory }).initialize())
            .rejects.toThrow(/does not export its PluridServer/);
    });

    it('a missing puppeteer fails before a server is forked', async () => {
        jest.doMock('puppeteer', () => {
            const error: NodeJS.ErrnoException = new Error("Cannot find module 'puppeteer'");
            error.code = 'MODULE_NOT_FOUND';
            throw error;
        });
        const { default: StillsGenerator } = require('../');

        const server = path.join(directory, 'server.js');
        // a server that records being started: it must not be
        fs.writeFileSync(server, SERVER.replace(
            "if (require.main === module) {",
            `if (require.main === module) {\n    require('fs').writeFileSync(${JSON.stringify(path.join(directory, 'forked'))}, 'yes');`,
        ));

        await expect(new StillsGenerator({ server, build: directory }).initialize())
            .rejects.toThrow(/'puppeteer' dependency is not installed/);
        expect(fs.existsSync(path.join(directory, 'forked'))).toBe(false);
    });

    it('never loads a kit application\'s entry, which starts its server when it is loaded (2026-10-20)', async () => {
        // Loaded to read its routes, the entry started a server inside the generator, which refused it and
        // stayed running on it. The kit's entry is also the default for a kit application.
        jest.doMock('puppeteer', () => fetchingPuppeteer);
        const { default: StillsGenerator } = require('../');

        fs.writeFileSync(path.join(directory, 'plurid.config.js'), 'module.exports = {};');
        fs.mkdirSync(path.join(directory, 'build'));
        const started = path.join(directory, 'started');
        fs.writeFileSync(path.join(directory, 'build', 'index.js'), [
            `require('fs').writeFileSync(${JSON.stringify(started)}, 'yes');`,
            'const startPluridServer = () => {};',
            'startPluridServer({});',
        ].join('\n'));
        const cwd = process.cwd();
        process.chdir(directory);
        try {
            await expect(new StillsGenerator().initialize()).rejects.toThrow(/kit application's entry/);
            await expect(new StillsGenerator({ server: './build/index.js' }).initialize()).rejects.toThrow(/kit application's entry/);
        } finally {
            process.chdir(cwd);
        }
        expect(fs.existsSync(started)).toBe(false);
    });

    it('writes the stills where the server reads them, its own `stillsDirectory` (2026-10-20)', async () => {
        jest.doMock('puppeteer', () => fetchingPuppeteer);
        const { default: StillsGenerator } = require('../');

        const server = path.join(directory, 'server.js');
        fs.writeFileSync(server, SERVER.replace("options: { stiller:", "options: { stillsDirectory: 'pre', stiller:"));

        await new StillsGenerator({ server, build: path.join(directory, 'build') }).initialize();
        expect(fs.existsSync(path.join(directory, 'build', 'pre', 'metadata.json'))).toBe(true);
    });

    it('writes the stills under the server\'s own build directory, unless told another (2026-10-22)', async () => {
        // They went to the generator's `./build/` whatever the server's `buildDirectory`, which the server reads them under.
        jest.doMock('puppeteer', () => fetchingPuppeteer);
        const { default: StillsGenerator } = require('../');

        const server = path.join(directory, 'server.js');
        fs.writeFileSync(server, SERVER.replace("options: { stiller:", "options: { buildDirectory: " + JSON.stringify(path.join(directory, 'dist')) + ", stiller:"));

        await new StillsGenerator({ server }).initialize();
        expect(fs.existsSync(path.join(directory, 'dist', 'stills', 'metadata.json'))).toBe(true);
    });

    it('says why the server it forked stopped: its error output was read by no one (2026-10-20)', async () => {
        jest.doMock('puppeteer', () => fetchingPuppeteer);
        const { default: StillsGenerator } = require('../');

        const server = path.join(directory, 'server.js');
        fs.writeFileSync(server, SERVER.replace(
            "if (require.main === module) {",
            "if (require.main === module) {\n    console.error('boom-reason');\n    process.exit(3);",
        ));
        const stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        try {
            await expect(new StillsGenerator({ server, build: directory }).initialize()).rejects.toThrow(/boom-reason/);
        } finally {
            stderr.mockRestore();
        }
    });
});
// #endregion module
