// #region imports
    // #region internal
    import {
        applicationService,
        orderedServices,
    } from '../shared';
    // #endregion internal
// #endregion imports



// #region module
/**
 * THE SEAM THE KIT GENERATES AGAINST.
 *
 * `<PluridApplication …/>` takes eighteen props for customization, persistence
 * and observation; the route-driven shape this kit generates forwarded five. So
 * seventeen documented props could not be reached from the way the kit tells
 * people to build — and every product worked around it the same way, in its
 * stylesheet, which is what a missing API looks like.
 *
 * `config.application` closes it, and it reaches both targets AS A SERVICE:
 * services are the one thing the kit already composes in an identical sequence
 * on the server and the client, so the SSR tree and the hydrated tree cannot
 * disagree about it.
 */
describe('the application surface', () => {
    const slot = () => null;

    it('adds no service at all when a config declares nothing', () => {
        expect(applicationService(undefined)).toEqual([]);
        expect(applicationService({})).toEqual([]);
    });

    it('carries the declared surface as the service\'s properties', () => {
        const [service] = applicationService({ renderEmpty: slot });

        expect(service.name).toBe('plurid-application');
        expect(service.properties).toEqual({ renderEmpty: slot });
        expect(typeof service.Provider).toBe('function');
    });

    it('sits OUTERMOST, above the router and every application under it', () => {
        const ordered = orderedServices([
            ...applicationService({ renderEmpty: slot }),
            { name: 'redux', Provider: (() => null) as any, order: 0 },
            { name: 'apollo', Provider: (() => null) as any, order: 1 },
        ] as any);

        expect(ordered.map((service) => service.name))
            .toEqual(['plurid-application', 'redux', 'apollo']);
    });

    it('and does not disturb the order a product chose for its own services', () => {
        const ordered = orderedServices([
            ...applicationService({ renderEmpty: slot }),
            { name: 'second', Provider: (() => null) as any },
            { name: 'first', Provider: (() => null) as any, order: -1 },
        ] as any);

        expect(ordered.map((service) => service.name))
            .toEqual(['plurid-application', 'first', 'second']);
    });

    it('SERVER AND CLIENT COMPOSE THE SAME LIST, which is the hydration guarantee', () => {
        // both targets build their services from the same two lines: the
        // application service first, then the product's own
        const config = {
            application: { renderEmpty: slot },
            services: [{ name: 'redux', Provider: (() => null) as any }],
        };

        const build = () => orderedServices([
            ...applicationService(config.application),
            ...(config.services || []),
        ] as any).map((service) => service.name);

        expect(build()).toEqual(build());
        expect(build()).toEqual(['plurid-application', 'redux']);
    });
});
// #endregion module
