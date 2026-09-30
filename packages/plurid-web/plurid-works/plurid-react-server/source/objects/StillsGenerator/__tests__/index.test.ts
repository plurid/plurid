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
        fs.rmSync(directory, { recursive: true, force: true });
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
});
// #endregion module
