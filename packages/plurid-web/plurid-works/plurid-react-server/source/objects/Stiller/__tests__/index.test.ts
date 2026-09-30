// #region imports
    // #region external
    import {
        replacePluridResolution,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
// `Stiller.still()` drives Puppeteer against a live server; here Puppeteer is a stand-in (the stills
// generator's own suite drives it against a real forked server). `replacePluridResolution` is its one
// pure, deterministic piece.
describe('Stiller — replacePluridResolution', () => {
    it('collapses the render viewport to zero to avoid the loading flash', () => {
        const html = '<div style="width: 1366px; height: 768px;">content</div>';
        expect(replacePluridResolution(html)).toBe('<div style="width: 0px; height: 0px;">content</div>');
    });

    it('leaves html without the render viewport untouched', () => {
        const html = '<div style="color: red;">content</div>';
        expect(replacePluridResolution(html)).toBe(html);
    });
});


/** A Puppeteer stand-in whose every navigation answers `status` with `html`. */
const puppeteerAnswering = (
    status: number,
    html = '<html><body>the page</body></html>',
) => ({
    launch: async () => ({
        newPage: async () => ({
            goto: async () => ({ status: () => status }),
            content: async () => html,
            close: async () => undefined,
        }),
        close: async () => undefined,
    }),
});

const configuration = { waitUntil: 'load' as const, timeout: 1000 };

const collect = async (sequence: AsyncGenerator<any>) => {
    const stills = [];
    for await (const still of sequence) {
        stills.push(still);
    }
    return stills;
};


describe('Stiller — the optional peer and the answers it stills (2026-09-29)', () => {
    afterEach(() => {
        jest.resetModules();
        jest.dontMock('puppeteer');
    });

    it('a missing puppeteer is reported as not installed', async () => {
        jest.doMock('puppeteer', () => {
            const error: NodeJS.ErrnoException = new Error("Cannot find module 'puppeteer' from 'Stiller/index.ts'");
            error.code = 'MODULE_NOT_FOUND';
            throw error;
        });
        const { loadPuppeteer } = require('../');
        await expect(loadPuppeteer()).rejects.toThrow(/'puppeteer' dependency is not installed/);
    });

    it('a puppeteer that is installed but fails to load says so, instead of "not installed"', async () => {
        jest.doMock('puppeteer', () => {
            const error: NodeJS.ErrnoException = new Error("Cannot find module 'puppeteer-core' from 'puppeteer/lib/cjs/puppeteer.js'");
            error.code = 'MODULE_NOT_FOUND';
            throw error;
        });
        const { loadPuppeteer } = require('../');
        const failure = loadPuppeteer();
        await expect(failure).rejects.toThrow(/installed but could not be loaded: Cannot find module 'puppeteer-core'/);
        await expect(failure).rejects.not.toThrow(/not installed/);
    });

    it('a page the server answered with an error status is not stilled (it would be served as a 200 page)', async () => {
        jest.doMock('puppeteer', () => puppeteerAnswering(404, '<html><body>[404] Not Found</body></html>'));
        const { default: Stiller } = require('../');
        const stiller = new Stiller({ host: 'http://localhost:1', routes: ['/gone'], configuration });
        await expect(collect(stiller.still())).rejects.toThrow(/Could not still '\/gone': the server answered 404/);
    });

    it('a page answered 200 is stilled', async () => {
        jest.doMock('puppeteer', () => puppeteerAnswering(200));
        const { default: Stiller } = require('../');
        const stiller = new Stiller({ host: 'http://localhost:1', routes: ['/'], configuration });
        const stills = await collect(stiller.still());
        expect(stills).toHaveLength(1);
        expect(stills[0]).toMatchObject({ route: '/', html: '<html><body>the page</body></html>' });
    });
});
// #endregion module
