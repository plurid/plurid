// #region imports
    // #region libraries
    import PluridServer from '@plurid/plurid-react-server';
    // #endregion libraries


    // #region internal
    import {
        createPluridServer,
    } from '../server';
    import {
        PRELOADED_REDUX_STATE_KEY,
        PRELOADED_PLURID_METASTATE_KEY,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
jest.mock('@plurid/plurid-react-server', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(function (this: any, configuration: any) {
        this.configuration = configuration;
    }),
}));


describe('createPluridServer()', () => {
    it('projects the config onto the server: the document head, the document hook (server-only thunk), the render mode, no helmet / customPlane', async () => {
        const hook = jest.fn();
        const server: any = await createPluridServer({
            serverName: 'kit test',
            routes: [],
            head: { title: 'kit', description: 'a kit app', meta: [{ property: 'og:site_name', content: 'plurid' }] },
            favicon: { icon: '/favicon.ico', themeColor: '#123' },
            manifest: '/manifest.json',
            document: () => Promise.resolve({ default: hook }),
            render: 'suspense',
            services: [
                { name: 'B', Provider: () => null, order: 2 },
                { name: 'A', Provider: () => null, order: 1 },
            ],
        } as any);

        expect(PluridServer).toHaveBeenCalledTimes(1);
        const configuration = server.configuration;
        expect(configuration.template.head).toEqual({ title: 'kit', description: 'a kit app', meta: [{ property: 'og:site_name', content: 'plurid' }] });
        expect(configuration.template.favicon).toEqual({ icon: '/favicon.ico', themeColor: '#123' });
        expect(configuration.template.manifest).toBe('/manifest.json');
        expect(configuration.template.vendorScriptSource).toBe('');
        expect(configuration.document).toBe(hook);
        expect(configuration.render).toBe('suspense');
        expect('helmet' in configuration).toBe(false);
        expect('customPlane' in configuration).toBe(false);
        // services keep their order (lower = inner) for the client to mirror
        expect(configuration.services.map((service: any) => service.name)).toEqual(['A', 'B']);
        expect(configuration.options.serverName).toBe('kit test');
    });

    it('exposes the preload keys the server template and the client agree on', () => {
        expect(PRELOADED_REDUX_STATE_KEY).toBe('__PRELOADED_REDUX_STATE__');
        expect(PRELOADED_PLURID_METASTATE_KEY).toBe('__PRELOADED_PLURID_METASTATE__');
    });
});
// #endregion module
