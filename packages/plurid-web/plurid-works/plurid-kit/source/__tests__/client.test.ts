// #region imports
    // #region libraries
    import {
        isValidElement,
        type ReactElement,
    } from 'react';

    import {
        hydrateRoot,
    } from 'react-dom/client';

    import {
        PluridRouterBrowser,
        PluridRouterStatic,
    } from '@plurid/plurid-react';
    // #endregion libraries


    // #region internal
    import {
        createPluridClient,
    } from '../client';
    import {
        createPluridServer,
    } from '../server';
    // #endregion internal
// #endregion imports



// #region module
jest.mock('react-dom/client', () => ({
    hydrateRoot: jest.fn(),
}));

jest.mock('@plurid/plurid-react-server', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(function (this: any, configuration: any) {
        this.configuration = configuration;
    }),
}));


/** The first element of `type` under `node`, depth first. */
const find = (
    node: unknown,
    type: unknown,
): ReactElement<any> | undefined => {
    if (Array.isArray(node)) {
        for (const child of node) {
            const found = find(child, type);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    if (!isValidElement(node)) {
        return undefined;
    }
    if (node.type === type) {
        return node as ReactElement<any>;
    }
    return find((node.props as any).children, type);
};


/**
 * The router element the server renders for a request: `PluridServer` keeps
 * `planes || []` and `routerProperties || {}` and resolves `options.hostname`
 * (else `'origin'`), and its request tree hands them to `PluridRouterStatic`
 * (plurid-react-server, `objects/Server/index.ts` and `render.tsx`).
 */
const serverRouter = (
    configuration: any,
) => PluridRouterStatic({
    path: '/',
    routes: configuration.routes,
    planes: configuration.planes || [],
    exterior: configuration.exterior,
    shell: configuration.shell,
    hostname: configuration.options.hostname || 'origin',
    routerProperties: configuration.routerProperties || {},
} as any) as ReactElement<any>;


/**
 * THE HYDRATION GUARANTEE, FOR THE ROUTER.
 *
 * The client must hydrate the tree the server rendered. 2026-09-29 it did not:
 * the server rendered the router with the config's hostname, planes and
 * exterior, the client with none of them, so every plane's route read
 * `plurid://<location.host>/…` in the browser where the server had written
 * `plurid://<hostname>/…`, and React threw the server's page away (#418).
 */
describe('createPluridClient() hydrates the router the server rendered', () => {
    const Shell = () => null;
    const Exterior = () => null;
    const Plane = () => null;

    beforeEach(() => {
        (hydrateRoot as jest.Mock).mockClear();
        (global as any).document = {
            getElementById: () => ({}),
        };
    });

    afterEach(() => {
        delete (global as any).document;
    });

    const clientRouter = (
        config: any,
    ) => {
        createPluridClient(config);
        const [, element] = (hydrateRoot as jest.Mock).mock.calls[0];
        return find(element.type(), PluridRouterBrowser);
    };

    it('with the same routes, planes, exterior, shell and hostname', async () => {
        const config: any = {
            serverName: 'kit',
            hostname: 'example.com',
            routes: [{ value: '/', planes: [['/one', Plane]], view: ['/one'] }],
            planes: [{ value: '/plane', component: Plane }],
            shell: Shell,
            exterior: Exterior,
        };
        const server: any = await createPluridServer(config);
        const {
            static: _static,
            protocol: _protocol,
            ...rendered
        } = serverRouter(server.configuration).props;

        const router = clientRouter(config);

        expect(router).toBeDefined();
        expect(router!.props).toEqual(rendered);
        expect(router!.props.hostname).toBe('example.com');
    });

    it('with the router properties over them, as the server spreads them', async () => {
        const config: any = {
            serverName: 'kit',
            hostname: 'example.com',
            routes: [{ value: '/', planes: [['/one', Plane]], view: ['/one'] }],
            shell: Shell,
            routerProperties: { cleanNavigation: true, hostname: 'plurid.example' },
        };
        const server: any = await createPluridServer(config);
        const {
            static: _static,
            protocol: _protocol,
            ...rendered
        } = serverRouter(server.configuration).props;

        const router = clientRouter(config);

        expect(router!.props).toEqual(rendered);
        expect(router!.props.hostname).toBe('plurid.example');
        expect(router!.props.cleanNavigation).toBe(true);
    });

    it('and the raw options\' hostname when a config sets one', async () => {
        const config: any = {
            serverName: 'kit',
            hostname: 'example.com',
            routes: [{ value: '/', planes: [['/one', Plane]], view: ['/one'] }],
            options: { hostname: 'www.example.com' },
        };
        const server: any = await createPluridServer(config);

        const router = clientRouter(config);

        expect(server.configuration.options.hostname).toBe('www.example.com');
        expect(router!.props.hostname).toBe('www.example.com');
    });
});
// #endregion module
